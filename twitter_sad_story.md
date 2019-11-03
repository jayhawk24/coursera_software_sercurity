Full name: Souhail Hammou
Facebook page: http://www.facebook.com/dark.puzzle.sec 
Official Website: http://www.dark-puzzle.com/ 
Email address: dark-puzzle@live.fr
Who is being affected?: Everyone on Twitter.
Environment: Browser : Any browser could be used by the victim or the attacker machine to perform the attack.
OS : All.
=======================
Describe the vulnerability: 
=======================
Twitter official website is prone to a cookie handling vulnerability caused by persistent cookies.This means that the cookie used for an authenticated session is still available even after the session has been terminated.So keeping the cookie active even if the user "logged out" and closed the session is dangerous ,
I've tried that many times on different machines and it still working by just replacing manually the auth_token cookie of a session , basically the user is disconnected so the cookie mustn't be valid anymore.However , it's not the case here.
The main cookies that have to be replaced is: auth_token
This cookie can be replaced manually by using Cookie editors available in multiple browsers like "Cookie Edit Addon" in mozilla firefox.
========================
Steps to reproduce issue: 
========================
Before going through this Twitter is using by default HTTPS connection, that is set by a cookie named "secure_session" pointing always to a TRUE value. After having the cookie using one of these ways , the attacker must replace the auth_token cookie by the new value then connect to the victim account. The attacker will be able to TWEET,EDIT,FOLLOW,UNFOLLOW ... And he will also be able to share the account with the victim , because the cookie is valid even if the victim is connected again.
"1st way : If the attacker and the victim are in the same LAN/WI-FI :"
The first way is that an attacker can steal the victims cookie is by sniffing over the network by performing an ARP poisoning attack then filtering the packets to get twitters' ones. As the packets are encrypted the attacker will use a famous tool named "SSLSTRIP" that will make the connection between him and the victim based on HTTP before going to the server-side as SSL encrypted. So the attacker will be able to get the cookies in plain text then use them to get into the victim account . An attacker can use those cookies any later time and from any machine , even after the victim closes its session or reconnect then disconnect.
"2nd way : If the attacker have physical access to the machine" :
When having physical access to the machine an attacker can simply extract the cookies and use them to login.
===============================
"3rd way : Malwares and Stealers" :
===============================
Attacker can get cookies remotely by compromising the victims machine and by using an cookie stealers or a RAT tool. 
===============================
"Impacts : Indentity Theft , Illegal Shared Material ... etc "
===============================

Twitter Claimed in their e-mail that this has been a critical problem for them, as it is hard to fix . The better solution for that is to make an expiry date to the cookie relative to the life-time of the session . So when the session is terminated the auth_token cookie will be no more valid.
