Github Repositories Dashboard
==============================

This is a simple dashboard to monitor your Github repositories. In a few words:

* It is written in Javascript, using [`github.js`](https://github.com/michael/github);
* It uses Github's API with OAuth in order to increase the amount of allowed requests;
* It supports auto-refresh;
* It supports plugins to easily extend the cells in the report.

## Query string parameters

This dashboard takes various query parameters:

* `org`: an organization to list repositories for;
* `user`: alternatively, a username to list repositories for;
* `refresh`: the refresh rate (defaults to 10 minutes);
* `refresh_randomize`: a factor by which to randomize refresh for elements (defaults to 0.5, making refresh times between 10 minutes and 15 minutes by default);
* `filter`: a filter to apply to repositories names.


## Plugins

Appart from the first (name) and last (refresh) columns, all columns in the dashboard are managed by plugins.

`index.html` provides an example skeleton for a dashboard. You can activate, move or remove columns easily.

Adding a `th` element with a `plugin:foo` class to the table head will automatically load the `foo` plugin in `plugins/foo.js` and use the `dashboard.foo()` function to fill in the cells for that column.

Therefore, all you need to do to add a new plugin is:

* Create a new plugin file in the `plugins/` directory, named according to your plugin name;
* Add a `dashboard.pluginname()` function to that file;
* Add a `th` element to the HTML skeleton to indicate where the column should be.

The `dashboard.pluginname()` function should call the `updateCell()` function to fill in the cells, with the following arguments:

* `repo`: the name of the repository (line) to update;
* `cell`: the name of the cell (plugin name) to update;
* `value`: the value (include HTML) to insert in the cell;
* `state` (optional): a state for the cell, among `ok`, `warn`, `err` and `unknown`. If any cell sends this parameter, a global state will be computed for the line, setting a class with the state value for the `tr` element. The default style maps these states to background colors (`ok`=`lightgreen`, `warn`=`khaki`, `err`=`lightcoral`).


## Setting up OAuth

This dashboard uses Github's OAuth to:

* increase the amount of allowed requests to Github's API;
* access private repositories in the dashboard.

### Setting up in the HTML file

Your HTML file should contain two links:

* A link with ID `auth_link`, whose `href` must point to `https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=repo` in a new window. This link will make the authentication request to Github, using the server-side callback;
* A link with ID `auth_remove`, pointing to `javascript:authRemove();`, which will delete the session cookie and allow users to authenticate again with Github.


### Setting up the server-side callback

OAuth on Github requires a server-side script to perform a final request and get an authentication token. This step cannot be achieved in Ajax.

This repository provides a sample script in PHP, but any server-side language will do just as well.

In the `auth.php` script, you need to edit `$client_id` and `$client_secret` to match your Github application settings. The script should then be named and hosted according to your application callback settings on Github.


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

