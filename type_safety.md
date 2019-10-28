1. Each object is ascribed a type
2. Operations on the object are always compatible with the object's type
3. Type safe progams do no " go wrong" at run time
4. Type safety is stronger than memory safety

# Canary values
1. terminator canaries (CR LF NUL)
leverages the fact that scanf etc dont allow these
2. random canaries
	write a new random value @ each process start
	save the real value somewhere in memory
	must write protect the strored value
3. Random XOR canaries
	same as randoms
	but store canary xor some control info instead

