# Hardcoded Flag Checker — Reversing Walkthrough

This walkthrough demonstrates how to reverse-engineer a compiled Linux binary that validates a user-supplied flag. No source code is provided — we work purely from the executable using static analysis.

---

## 1. Black-Box Observation (Dynamic Analysis)

Start by running the binary to understand its basic behavior.

```
Enter the flag:
```

Supplying a random string:

```
Enter the flag: test
Incorrect flag. Try again!
```

**Key Takeaways:**

- The binary accepts a single string input and checks it against something.
- There is a correct path (the flag is accepted) and a failure path.
- No hints about the expected format are given — we need to go deeper.

---

## 2. Loading the Binary in Ghidra

Open the binary in **Ghidra**, create a new project, import the file, and let auto-analysis run.

Navigate to the **Symbol Tree → Functions → `main`** and open the decompiled view.

---

## 3. Static Analysis — Reading the Decompiled Output

The decompiler output for `main` reveals the full logic immediately.

### 3.1 The Encrypted Flag Buffer

Near the top of `main`, Ghidra shows a local array being initialized with hardcoded byte values:

```c
unsigned char encrypted_flag[] = {
    0x39, 0x2e, 0x3c, 0x21, 0x28, 0x69, 0x0c, 0x2f,
    0x67, 0x63, 0x14, 0x1d, 0x1d, 0x67, 0x6b, 0x09,
    0x67, 0x6e, 0x63, 0x69, 0x6b, 0x67, 0x69, 0x27
};
int flag_len = 24;
```

This is a 24-byte encrypted blob stored directly in the binary. It is not the flag in plaintext — it needs to be decoded first.

### 3.2 The Input and Comparison

Further down, the decompiler shows:

```c
char user_input[32];
scanf("%31s", user_input);

if (len > 7 && strncmp(user_input, "R3v_123", 7) == 0) {
    // print flag
} else {
    printf("Incorrect flag. Try again!\n");
}
```

A few things stand out:

- **Not a full `strcmp`:** The binary uses `strncmp` with a length argument of `7`, meaning it only validates the first 7 characters against `"R3v_123"`. Searching strings in `.rodata` will surface `R3v_123`, but blindly submitting it will still fail — the length check blocks it.
- **The exact length guard:** `len > 7` means the input must be more than 7 characters. Combined with the 7-character prefix, this tells us the password is `R3v_123` followed by one or more unknown characters.
- **Brute-forcing the 8th byte:** The final character is unconstrained — nothing in the binary checks it beyond the length condition. Any character that makes the total length greater than 7 satisfies the check. This is trivially brute-forceable:

```python
import subprocess

prefix = "R3v_123"
charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$_"

for c in charset:
    attempt = prefix + c
    result = subprocess.run(["./binary"], input=attempt, capture_output=True, text=True)
    if "Correct" in result.stdout:
        print(f"Password found: {attempt}")
        print(result.stdout)
        break
```

### 3.3 The Decryption Routine

Inside the success branch, the flag is not stored in plaintext — it is decoded on the fly via a XOR loop:

```c
for (int i = 0; i < flag_len; i++) {
    printf("%c", encrypted_flag[i] ^ 0x5A);
}
```

Each byte of `encrypted_flag` is XOR'd against the single-byte key `0x5A` and printed as a character. Since XOR with a constant key is fully reversible, we can decrypt the flag without even running the binary.

---

## 4. Two Paths to the Flag

### Path 1 — Brute-Force the 8th Character and Run It

Use the script from section 3.2 to iterate through printable characters until the binary outputs `Correct!`.

### Path 2 — Decrypt Statically (No Execution Needed)

We already have the encrypted bytes and the XOR key from static analysis. We can decode the flag entirely offline regardless of the password:

```python
encrypted = [
    0x39, 0x2e, 0x3c, 0x21, 0x28, 0x69, 0x0c, 0x2f,
    0x67, 0x63, 0x14, 0x1d, 0x1d, 0x67, 0x6b, 0x09,
    0x67, 0x6e, 0x63, 0x69, 0x6b, 0x67, 0x69, 0x27
]

key = 0x5A
flag = ''.join(chr(b ^ key) for b in encrypted)
print(flag)
```

Running this produces the plaintext flag directly — no binary execution or password required.

---

## 5. Key Takeaways

| Weakness | Detail |
|---|---|
| Partial `strncmp` check | Only first 7 bytes validated — 8th character is unconstrained |
| Exact length guard bypassable | `len > 7` combined with known prefix → single byte brute-force |
| Weak XOR cipher | Single-byte key `0x5A`, no additional obfuscation |
| Encrypted blob in binary | All 24 flag bytes present in the executable — fully recoverable statically |

The main added complexity over a plain `strcmp` is recognizing that `strncmp` with length `7` leaves the 8th character open — and that the flag itself can be recovered statically without ever cracking the password.