# Web Boxes

Eeasy as pie Bitnami Installers for local web develoment.

Install and administer any Bitnami installer from one app.

- [ ] Get Name of Box / Blog name
- [ ] Install bitnami
- [ ] Do Customization
- [ ] Phpinfo
- [ ] Starter Information before first box creation

Bitnami WordPress Stack 5.6-0
Usage:

--help Display the list of valid options

--version Display product information

--unattendedmodeui none Unattended Mode UI
Default: none
Allowed: none minimal minimalWithDialogs

--optionfile <optionfile> Installation option file
Default:

--debuglevel <debuglevel> Debug information level of verbosity
Default: 2
Allowed: 0 1 2 3 4

--mode unattended Installation mode
Default: qt
Allowed: qt gtk xwindow text unattended

--debugtrace <debugtrace> Debug filename
Default:

--disable-components varnish Comma-separated list of components
Default:
Allowed: varnish phpmyadmin

--prefix path/to/installdir Select a folder
Default:

--base_user_name <user_name> Your real name
Default: User Name

--base_mail <base_mail> Email Address
Default: user@example.com

--base_user <base_user> Login
Default: user

--base_password <base_password> Password
Default:

--apache_server_port 8081.... Apache Web Server Port
Default: 80 or 8080 - depending on your permissions

--apache_server_ssl_port <apache_server_ssl_port> SSL Port
Default: 443 or 8443 - depending on your permissions

--mysql_port <mysql_port> 3306 MySQL Server port
Default: 3306

--mysql_password <mysql_password> MySQL Server root password
Default:

--mysql_database_name <mysql_database_name> DB Name
Default: mysql_db

--mysql_database_username <mysql_database_username> DB User Name
Default: mysql_user

--mysql_database_password <mysql_database_password> DB User Password
Default:

--wordpress_blog_name <wordpress_blog_name> Blog name
Default: user's Blog!

--wordpress_site <wordpress_site> Hostname
Default: i7590

--smtp_email_provider <smtp_email_provider> Default email provider:
Default: custom
Allowed: gmail custom

--smtp_enable <smtp_enable> Do you want to configure mail support?
Default: 0

--smtp_user <smtp_user> Username
Default:

--smtp_password <smtp_password> Password
Default:

--smtp_host <smtp_host> SMTP Host
Default:

--smtp_port <smtp_port> SMTP Port
Default: 587

--smtp_protocol <smtp_protocol> Secure connection
Default: tls
Allowed: none ssl tls

--phpmyadmin_password <phpmyadmin_password>  
 Default:

--launch_cloud 0 Launch wordpress in the cloud with Bitnami
Default: 1
