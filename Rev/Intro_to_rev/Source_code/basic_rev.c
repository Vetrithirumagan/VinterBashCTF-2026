#include <stdio.h>
#include <stdlib.h>
#include <string.h> 

int main(){
    unsigned char encrypted_flag[] = {
        0x39, 0x2e, 0x3c, 0x21, 0x28, 0x69, 0x0c, 0x2f, 
        0x67, 0x63, 0x14, 0x1d, 0x1d, 0x67, 0x6b, 0x09, 
        0x67, 0x6e, 0x63, 0x69, 0x6b, 0x67, 0x69, 0x27
    };
    int flag_len = 24;

    printf("Enter the flag: ");
    char user_input[32];
    if (scanf("%31s", user_input) != 1) {
        printf("Error reading input.\n");
        return 1;
    }

    int len = strlen(user_input);
    

    if (len > 7 && strncmp(user_input, "R3v_123", 7) == 0) {
        printf("Correct! The flag is: ");
        for(int i = 0; i < flag_len; i++) {
            printf("%c", encrypted_flag[i] ^ 0x5A);
        }
        printf("\n");
        
    } else {
        printf("Incorrect flag. Try again!\n");
    }

    return 0;
}