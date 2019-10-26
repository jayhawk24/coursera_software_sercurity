# buffer
contiguos memory associated with a varibale or field
# overflow
Put more into the buffer than it can hold
# heartbleed
The Heartbleed bug was a read overflow in exactly this style
\n
The ssl server should accept a "heartbeat" message that it echoes back
\r\n
the heartbeat message specifies teh length of its echo back portion but the buggy ssl software did not check the length was accurate
\r\n
Thus an attacker coud request a longer lengtrh and read [ast the contents of the buffer leaking passwords crypto keys, ...
# stale memory
A dangling pointer bug occurs when a pointer is freed but the program continuesto use it
\r\n
An attacker can arrange for the freed memory to be reallocated and under his control
>when the dengling pointer is dereferenced it will access attacker controlled data

# format string attacks
## why is this a buffer overflow
we should think of this as a buffer overflow in the sense that 
the stack itself can be viewed as a kind of buffer
the size of that buffer is determined by the number and size of the arguments passed to a funcion
\r\n
the size of that buffer is determined by the number and size of the arguments passed to a function
\r\n
providing a bugus format string thus induces the program to overflow that buffer

