# Memory safe execution of programs
1.only creates pointers thourgh standard mmeans 
2. only uses a pointer to access memory that belongs to that pointer

Combines two ideas:
temporal safety
spatial safety

## spatial safety
Spacial safety means that accesses by a pointer should only be to memory that the pointer owns, which is to say that belongs to it.
1. View pointers as triples (p,b,e)
	a. p is the pointer actual
	b. b is the base of the memory region it may access
	c. e is the extent (bounds) of that region
2. And access allowed iff b<= p <= e-sizeof(typeof(p))
3. Operations
	a. Pointer arithmetic increments p, leaves b and e alone.
	b. Using & : e determined by size of original type
## temporal safety
1. A temporal safey violation occurs when trying to access undefined memory
	spatial safey assures it was to a legal region
	temporal safety assures taht region is stil in play
2. Memory regions either defined of undefined 
	defined means allocated and active
	undefined means unallocated , uninitialized or, deallocated
3. Pretend memory is infinitely large ( we never reuse it)

