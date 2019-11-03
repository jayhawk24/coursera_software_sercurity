## Stealing Session Cookies
#### Compromise the server or users machine / browser
#### Predict it based on other information you know
#### Sniff the network
#### DNS cache poisoning 
##### Trick the user into thinking you are Facebook
##### The user will send you the cookie

## Twitter sad story
#### uses one cookie (auth-token) to validate ser which is a function of username password
### Auth-token weaknesses
#### Does not change from one login to the next 
#### Does not become invalid when the user logs out
#### thus steal this cookie one and you can log in as user any time you want ( until password change)
### Defense
#### timeout session IDs and delete them once the session ends

## Non - defense
### Address based non defence: 
Store client IP address for session if session changes to a different address must be a session hijack right ?
### Problem false positives:
IP address change!
Moving between wifi nework and 3G network 
DHCP renegotiation
### Problem false negatives could be hijacked to different machine with same IP address 
both requests via same NAT(Network address translator) box
