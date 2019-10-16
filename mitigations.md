# This contains notes for Mitigations for Common Vuln in C programmes
### gets
Prefer using fgets and dynamically allocated memory.
\n
`fgets(username,LENGTH, stdin);
    // fgets stops after LENGTH-1 characters or at a newline character, which ever comes first.
    // but it considers \n a valid character, so you might want to remove it:
    nlptr = strchr(username, '\n');`

### strcpy
use strlcpy but it is only available in BSD systems so we can define it by: \n
`#define strlcpy(dst,src,sz) snprintf((dst), (sz), "%s", (src))
int buffer_length = strlcpy(dst, src, BUFFER_SIZE);
`
strncpy can also work but it is less convinient and does not guarantee '\0' termination.

`strncpy(str1,str2, BUFFER_SIZE); /* limit number of characters to be copied */
// We need to set the limit to BUFFER_SIZE, so that all characters in the buffer
// are set to '\0'. If the source buffer is longer than BUFFER_SIZE, all the '\0'
// characters will be overwritten and the copy will be truncated.
`

