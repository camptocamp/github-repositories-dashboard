Github Repositories Dashboard
==============================

This is a simple dashboard to monitor your Github repositories. In a few words:

* It is written in Javascript, using [`github.js`](https://github.com/michael/github);
* It uses Github's API with OAuth in order to increase the amount of allowed requests;
* It supports auto-refresh;
* It supports plugins to easily extend the cells in the report.

## Setting up OAuth

This dashboard uses Github's OAuth to:

* increase the amount of allowed requests to Github's API;
* access private repositories in the dashboard.

### Setting up in the HTML file

### Setting up the server-side callback

OAuth on Github requires a server-side script to perform a final request and get an authentication token. This step cannot be achieved in Ajax.


## Contributing

Please report bugs and feature request using [GitHub issue
tracker](https://github.com/camptocamp/puppet-modules-dashboard/issues).


## License

Copyright (c) 2013 <mailto:puppet@camptocamp.com> All rights reserved.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

