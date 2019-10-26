# Memory Allocation
Heap grows upwards and stack grows downwards
stack pointer eip is at the top of the stack
when program issues a push instruction stack pointer goes down

## basic stack layout
arguments of a function are pushed in reverse order

Local varibles are pushed in the same order as they appear in the code
\n
frame pointer or %ebp register stores address within the stack frame of local varibles and arguments.

