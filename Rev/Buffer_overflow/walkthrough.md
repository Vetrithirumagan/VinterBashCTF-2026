# Stack-Based Variable Overwrite — Binary Exploitation Walkthrough

This walkthrough demonstrates how to analyze and exploit a compiled Linux binary utilizing a **Stack-Based Variable Overwrite**. In black-box scenarios (where source code is unavailable), we must combine dynamic analysis (observing program behavior with inputs) and static analysis clues to map the stack layout and hijack control flow logic.

---

## 1. Black-Box Observation (Dynamic Analysis)

Without source code, we begin by running the binary locally to map its basic execution path, inputs, and outputs.

When executed, the binary prompts for input:

```
Enter some text:
```

If we input a standard string like `test`, the binary returns:

```
Buffer contains: test
Modified variable value: 0x00000000
Try again! You didn't overflow far enough to hit 'modified'.
```

**Key Takeaways from the Output:**

- **The Sink:** The program prints a 4-byte hex value labeled `Modified variable value`.
- **The Logic:** The error message explicitly states that our goal is to "overflow far enough to hit 'modified'". This tells us that a target variable (`modified`) sits immediately adjacent to our input buffer on the stack.
- **The Condition:** If `Modified variable value` becomes non-zero (`!= 0x00000000`), the failure branch will not execute, likely redirecting execution to a success (win) function.

---

## 2. Analyzing the Vulnerability

Because the program allows the user to input data without restricting the length, it is highly probable that it utilizes an unsafe input function like `gets()` or `scanf("%s")`.

When a function is called, the compiler allocates a **stack frame** to hold local variables. On standard architectures, the stack grows **downward** (toward lower memory addresses), but variables within the stack are written **upward** (from lower to higher memory addresses).

```
Low Memory Addresses
┌─────────────────┐
│  Input Buffer   │  <-- Data is written here and fills upward
├─────────────────┤
│     Padding     │  <-- Compiler alignment gap (if any)
├─────────────────┤
│  Target Var     │  <-- The 'modified' variable we want to hit
└─────────────────┘
High Memory Addresses
```

If we provide an input string that exceeds the boundary of the allocated input buffer, the data will spill out of the buffer's bounds, traverse any compiler padding, and begin overwriting the memory allocated for the `modified` variable.

---

## 3. Determining the Exact Stack Offset

To exploit this structure, we must calculate the exact **distance (offset)** between the start of our input buffer and the start of the `modified` variable.

> Compilers frequently align data to 4, 8, or 16-byte boundaries for performance reasons, meaning the space between variables may be slightly larger than what the program appears to use internally.

### Static Analysis — Confirming Buffer Size

Before probing blindly, we can open the binary in a disassembler (Ghidra / IDA Free) and inspect the decompiled output of the vulnerable function. The decompiler reveals something like:

```c
void vuln() {
    char buffer[64];
    int modified = 0;

    gets(buffer);
    ...
}
```

This tells us two things with certainty:
- The input buffer is **exactly 64 bytes**.
- `modified` is declared immediately after `buffer` in the source — meaning it sits right above it on the stack, separated only by any compiler alignment padding.

We no longer need to guess the starting point; we know overflow begins at byte 65.

### Step-by-Step Offset Discovery

1. **Baseline Test:** Send exactly 64 characters (e.g., 64 `A`s) — we already know this fills the buffer to the brim.
2. **Observation:** Output still reads `Modified variable value: 0x00000000`, confirming compiler padding exists between the buffer and `modified`.
3. **Incremental Probing:** Increase the payload beyond 64 in small increments (68, 72, 76 bytes) using recognizable character patterns to walk across the padding.
4. **Analyze the Hex Output:** Monitor the `Modified variable value` line. The moment it changes from `0x00000000`, an overwrite has occurred.

**Example:** If you send 73 bytes consisting of 72 `A`s and 1 `B`, and the output changes to:

```
Modified variable value: 0x00000042
```

> `0x42` is the hexadecimal representation of the ASCII character `B`.

This confirms that the **exact offset** required to reach the target variable is **72 bytes**.

---

## 4. Constructing the Payload

Once the offset is determined, the exploit structure is straightforward. It requires no complex shellcode or Return-Oriented Programming (ROP) chains because the program evaluates the variable locally.

### Payload Structure

| Component | Size | Value |
|---|---|---|
| Padding | 72 bytes | `\x41` / `A` — saturates the buffer and alignment gap |
| Trigger Value | 1+ bytes | Any non-zero byte, e.g., `\x01` or `\x42` |

When this raw payload is piped into the binary, the trailing trigger byte lands directly in the memory space allocated for `modified[0]`.

```bash
python3 -c "import sys; sys.stdout.buffer.write(b'A' * 72 + b'\x01')" | ./binary
```

---

## 5. Execution and Flag Recovery

When the program executes the condition check:

1. It looks at the memory address assigned to the `modified` variable.
2. It detects that the value is no longer zero (`0x00000042` instead of `0x00000000`).
3. The conditional jump instruction changes execution flow, **bypassing the "Try again!" failure branch**.
4. Control flow hops directly into the binary's internal flag-printing routine, which handles decryption of the embedded cipher bytes locally and prints the plaintext flag to standard output.