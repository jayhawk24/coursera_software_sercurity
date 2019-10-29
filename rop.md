# Return Oriented Programming
## Introduced by Hovav Shacham in 2007
### The geiometry of innocent flesh on the bone : return into lic without function calls on the x86), CCS'07
## Idea
### rather than use a single libc function to run your shellcode, string together pieces of existing code called gadgets to do it instead
## Challenges
### Find the gadgets you need
### String them together

# Approach
### Gadgets are instructions groups that end with ret
### Stack serves as the code
#### %esp = program counter
#### Gadgets invoked via ret instruction
#### Gadgets get their arguments via pop,etc
##### also on the stack

# Where are the gadgets?
### Automate a search of the target binary for gadgets ( look for ret instructions )

# Blind ROP
### Defense : Randomizin the location of the code ny compiling for position independence on a 64 bit machine makes attacks very difficult
### Attack :
#### If server restarts on a crash but does not re randomize :
##### Read the stack to leat cnaries and a return address
##### Find Gadgets at run time to effect call to write 
##### Dump binary to find gadgets for shellcode

