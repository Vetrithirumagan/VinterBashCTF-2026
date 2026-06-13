#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void win() {
    unsigned char encrypted_flag[] = {
        0x39, 0x2e, 0x3c, 0x21, 0x18, 0x0f, 0x1c, 0x1c,
        0x69, 0x08, 0x05, 0x6a, 0x0c, 0x69, 0x08, 0x1c,
        0x16, 0x6a, 0x0d, 0x05, 0x09, 0x0f, 0x19, 0x19,
        0x1f, 0x09, 0x09, 0x27
    };
    int flag_len = 28;
    for(int i = 0; i < flag_len; i++) {
            printf("%c", encrypted_flag[i] ^ 0x5A);
        }
        printf("\n");
}

int main() {
    setvbuf(stdout, NULL, _IONBF, 0);
    setvbuf(stdin, NULL, _IONBF, 0);

    char modified[100] = {0}; 
    char buffer[64];

    printf("Enter some text: ");
    
    gets(buffer); 


    printf("Buffer contains: %s\n", buffer);
    
    printf("Modified variable value: 0x%02x%02x%02x%02x\n", 
           modified[0], modified[1], modified[2], modified[3]);
    
    if (modified[0] != 0) { 
        win();
    } else {
        printf("Try again! You didn't overflow far enough to hit 'modified'.\n");
    }

    return 0;
}