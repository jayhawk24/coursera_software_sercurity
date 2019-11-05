## Two types of xss 
### Stored or persistent XSS attack
#### Attacker leaves their script on the bank.com server
#### the server alter unwittingly send it to your browser
#### your browser executes it within the same origin as the bank . com server

### Reflected XSS attack
#### Attacker gets you to send the bank .com server a url that includes some javascript code
#### bank echoes the script back to you in its response 
#### your browser executes the scrpt in the response within the same origin as bank.com


