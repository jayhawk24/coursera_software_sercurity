## Using prepared statements
` $db = nnew mysql("localhost ", 'user', 'pass' , 'DB');
$statement = $db -> prepare("select * from users where(name=? and password=?);");
$statement -> bind_param("ss",$user,$pass);
$statement -> execute();
`
## Limit Privileges
#### reduces power of exploitation
## Encrypt sensitive data
#### Stored in the database , less useful if stolen


