#This contains notes for Mitigations for Common Vuln in C programmes
###gets
Prefer using fgets and dynamically allocated memory.
`fgets(username,LENGTH, stdin);
    // fgets stops after LENGTH-1 characters or at a newline character, which ever comes first.
    // but it considers \n a valid character, so you might want to remove it:
    nlptr = strchr(username, '\n');`


