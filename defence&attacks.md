## defense
make stack non executable to prevent injection of code
## attack
Jump/return to libc
## defense
Hide the address of desired libc code or return address using ASLR
## attack
Brute force search or information leak (format string vuln)
## defense
Avoid using libc code entirely and use code in the program text instead
## attack
Construct needed functionality using ROP

