## CSRF
#### target 
User who has an acc on a vulnerable server
#### attack goal
make requests to the server via the users browser that look to the server that lock to the server like the user intended to make them
#### key tricks
Requests to the web server have predictable structure
Use of something like <img src=...> to force the victim to send it

### Defense
#### remove referer
##### Not included by all browsers (referer)
##### Response lenient referer checking 
##### Blocks requests with a bad referrer but allows requests with no referrer
##### Missing referrer is not always harmless as
###### Bounce user off of ftp page
###### Exploit browser vulnerablity and remove it
###### Man in the middle network attack

#### use secretized links
##### Include a secret in every link / form
###### Can use a hidden from field custom HTTP header or encode it directly in the URL
###### Must not be guessable value
###### Can be same as session id sent in cookie
