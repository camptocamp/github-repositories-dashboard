/* Main */

var dashboard = new Object();
var cookies = new Object();
var sortTimeout;
var repositories;
var gh_user;
var github;
var token;
var account;
var refresh;
var refresh_randomize;
var reposFunc;
var repoHeads;
var plugin_options;

(function() {

  updateCell = function(repo, cell, value, state, customkey) {
    var repoLine = document.getElementById(repo);
    var cell = repoLine.getElementsByClassName('plugin:'+cell)[0];
    cell.innerHTML = value;
    if (state) {
      var classes = cell.className.replace(/unknown|err|warn|ok/, '');
      cell.className = classes+' '+state;
    }
    if (customkey) {
      cell.setAttribute('sorttable_customkey', customkey);
    }
    computeState(repoLine, state);
    refreshSortTimeout();
  }

  function computeState(line, newState, force) {
    var oldState = 'unknown';
    var classes = line.className.split(' ');
    var state;
    var cells = line.getElementsByTagName('td');
    var refreshCell = cells[cells.length-1];
    var stateWeight = parseInt(refreshCell.getAttribute('sorttable_customkey')) || 0;
    if (classes.length > 0) {
      for (var i=0; i<classes.length; i++) {
        if (classes[i].match(/unknown|err|warn|ok/)) {
          oldState = classes[i];
          classes.splice(i, 1);
          break;
        }
      }
      if (force) {
        state = newState;
        stateWeight = stateToNum(newState);
      } else {
        state = worstState(oldState, newState);
        stateWeight += stateToNum(newState);
      }
      classes.push(state);
      line.className = classes.join(' ');
    } else {
      state = newState;
      line.className = newState;
    }
    // Use the refresh column to sort by state
    refreshCell.setAttribute('sorttable_customkey', stateWeight);
    refreshCell.getElementsByTagName('i')[0].setAttribute('title', 'score: '+stateWeight);
    refreshTotalScore();
  }

  // TODO: give a numerical weight to each line
  function stateToNum(state) {
    switch (state) {
      case 'err':
        return 1000;
      case 'warn':
        return 100;
      case 'ok':
        return 0;
      default:
        return 10;
    }
  }

  function worstState(oldState, newState) {
    switch (newState) {
      case 'err':
        return 'err';
      case 'warn':
        if (oldState != 'err') return 'warn';
      case 'ok':
        if (oldState != 'err' && oldState != 'warn') return 'ok';
      default:
        return oldState;
    }
  }

  function refreshSort() {
    var reposTable = document.getElementById('repositories');
    var heads = reposTable.getElementsByTagName('th');
    for (var i=0; i<heads.length; i++) {
      if (heads[i].className.match(/\bsorttable_([a-z0-9]+)_reverse\b/)) {
        // first sort by name
        sorttable.innerSortFunction.apply(heads[0], []);
        // sort twice to reverse
        sorttable.innerSortFunction.apply(heads[i], []);
        sorttable.innerSortFunction.apply(heads[i], []);
        break;
      } else if (heads[i].className.match(/\bsorttable_sorted([a-z0-9]*)\b/)) {
        // first sort by name
        sorttable.innerSortFunction.apply(heads[0], []);
        sorttable.innerSortFunction.apply(heads[i], []);
        break;
      }
    }
  }

  // Cookies
  
  function createCookie(name,value,days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  }

  function readCookie(name) {
    var value = cookies[name];
    if (value) {
      return value;
    } else {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
          value = c.substring(nameEQ.length,c.length);
          cookies[name] = value;
          return value;
        }
      }
    }
    return null;
  }

  function eraseCookie(name) {
    createCookie(name,"",-1);
  }
  
  function dispError(err) {
    var reposTable = document.getElementById('repositories');
    var reposTableBody = document.getElementsByTagName('tbody')[0];
    var errElem = document.createElement('tr');
    errElem.setAttribute('id', 'error');
    errElem.innerHTML = '<td colspan="'+(repoHeads.length+2)+'">'+err+'</td>';
    reposTableBody.appendChild(errElem);
  }

  function refreshSortTimeout () {
    clearTimeout(sortTimeout);
    sortTimeout = setTimeout(function() {refreshSort()}, 500);
  }
  
  
  function refreshTotalScore() {
    var totalScore = 0;
    var reposTable = document.getElementById('repositories');
    var reposLines = document.getElementsByTagName('tr');
    // Ignore title line
    for (var i=1; i<reposLines.length; i++) {
      var cells = reposLines[i].getElementsByTagName('td');
      var scoreCell = cells[cells.length-1];
      var score = parseInt(scoreCell.getAttribute('sorttable_customkey')) || 0;
      totalScore += score;
    }
  
    var totalScoreElem = document.getElementById('total_score');
    totalScoreElem.innerHTML = 'Total score: '+totalScore;
  }
    
  function updateRepo(name) {
    var r = github.getRepo(account, name);
    repositories[name]['repo'] = r;
    var repoLine = document.getElementById(name);
    computeState(repoLine, 'unknown', true);
  
    r.show(function(err, repo) {
      // refresh all cells
      for (i=0; i<repoHeads.length; i++) {
        var plugin = repoHeads[i].replace('plugin:', '');
        dashboard[plugin](repo);
      }
    });
  
    // auto-refresh
    if (refresh > 0) {
      refresh_time = refresh + Math.random()*refresh*refresh_randomize;
      setTimeout(function() {updateRepo(name)}, refresh_time);
    }
  }
    
  function listRepos(err, repos) {
    var spinner = document.getElementById('spinner');
  
    if (err) {
      spinner.style.display = 'none';
      var err_msg = JSON.parse(err.request.responseText, function(key, value) { return value;});
      dispError('Error '+err.request.status+' ('+err.request.statusText+'): '+err_msg.message);
      return;
    }
  
    var reposTable = document.getElementById('repositories');
    var reposTableBody = document.getElementsByTagName('tbody')[0];
  
    spinner.style.display = 'none';
  
    // Filter repos
    var filtered_repos = [];
    for (var i=0; i<repos.length; i++) {
      var name = repos[i].name;
      if (filter) {
        filterReg = new RegExp(filter);
        if (! name.match(filterReg)) continue;
      }
      filtered_repos.push(name);
      repositories[name] = {};
      repositories[name]['info'] = repos[i];
    }
  
    // Update total
    var total = document.getElementById('total');
    if (total) {
      total.innerHTML = filtered_repos.length+' repositories';
    }
  
    for (var i=0; i<filtered_repos.length; i++) {
      var name = filtered_repos[i];
      var existing = document.getElementById(name);
      if (! existing) {
        var repoLine = document.createElement('tr');
        repoLine.setAttribute('id', name);
        reposTableBody.appendChild(repoLine);
  
        initRepo(name, repoHeads);
        updateRepo(name);
      }
    }
    filtered_repos.sort();
  
    // Remove obsolete lines
    var listedRepos = reposTableBody.getElementsByTagName('tr');
    for (var i=0; i<listedRepos.length; i++) {
      var name = listedRepos[i].id;
      if (filtered_repos.indexOf(name) < 0) {
        listedRepos[i].style.display = 'none';
        refreshSort();
      }
    }
  
    // auto-refresh
    if (refresh > 0) {
      refresh_time = refresh + Math.random()*refresh*refresh_randomize;
      setTimeout(function() {reposFunc(account, listRepos)}, refresh_time);
    }
  }
 
  function initRepo(name, heads) {
    info = repositories[name]['info'];
    html = '<td><a href="'+info.html_url+'">'+name+'</a></td>';

    for (i=0; i<heads.length; i++) {
      html += '<td class="'+heads[i]+'"><i class="fa fa-spinner fa-spin"></i></td>';
    }
  
    html += '<td><a href="javascript:updateRepo(\''+name+'\')"><i class="fa fa-refresh fa-1g"></i></a></td>';
    document.getElementById(name).innerHTML = html;
  }
  
  function addCookie(name, value, expire) {
    createCookie(name, value, expire);
    cookies[name] = null;
  }

  var GHDashboard = function(options) {
    var org = options.org;
    var user = options.user;
    refresh = options.refresh || 1800000; // 30 minutes
    refresh_randomize = options.refresh_randomize || 0.5; // up to 15 minutes
    var filter = options.filter;
    var autoload = options.autoload;
    var auth_link = options.auth_link || 'auth_link';
    var auth_link_priv = options.auth_link_priv || 'auth_link_priv';
    var auth_remove = options.auth_remove || 'auth_remove';
    plugin_options = options.plugin_options || {};

    account = org || user;

    this.sortByState = function() {
      var reposTable = document.getElementById('repositories');
      var heads = reposTable.getElementsByTagName('th');
      var refreshTH = heads[heads.length-1];
      sorttable.innerSortFunction.apply(refreshTH, []);
      // Twice, to sort by reverse order
      sorttable.innerSortFunction.apply(refreshTH, []);
    }
 
    this.refreshList = function() {
      reposFunc(account, listRepos);
    }
  
    this.authRemove = function() {
      cookie_names = Object.keys(cookies);
      for (var i=0; i<cookie_names.length; i++) {
        eraseCookie(cookie_names[i]);
      }
      window.location.reload();
    }
  
    // Plugins
    this.loadPlugin = function(plugin) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'plugins/'+plugin+'.js'; 
      document.body.appendChild(script);
    }

    this.load = function(token, scope) {
      if (token) {
        var auth_link_e = document.getElementById(auth_link);
        var auth_link_priv_e = document.getElementById(auth_link_priv);
        var auth_remove_e = document.getElementById(auth_remove);
        if (auth_link_e) {
          auth_link_e.style.display = 'none';
        }
        if (scope == 'repo' && auth_link_priv_e) {
          auth_link_priv_e.style.display = 'none';
        } else {
          auth_link_priv_e.style.display = 'inline-block';
        }
        if (auth_remove_e) {
          auth_remove_e.style.display = 'inline-block';
        }
        github = new Github({
          token: token
        });
      } else {
        // It's ok not to be authenticated
        github = new Github({});
      }
    
      gh_user = github.getUser();
    
      var reposTable = document.getElementById('repositories');
      var reposTableBody = document.getElementsByTagName('tbody')[0];
    
      // Remove all lines in body
      while (reposTableBody.hasChildNodes()) {
        reposTableBody.removeChild(reposTableBody.lastChild);
      }
    
      // Initialize
      repositories = {};
      repoHeads = [];
    
      // Get heads
      var headElems = reposTable.getElementsByTagName('th');
      for (var i=0; i<headElems.length; i++) {
        classes = headElems[i].className.split(' ');
        for (var j=0; j<classes.length; j++) {
          if (classes[j].match(/^plugin:/)) {
            repoHeads.push(classes[j]);
          }
        }
      }
    
      // Load plugins
      for (var i=0; i<repoHeads.length; i++) {
        var plugin = repoHeads[i].replace('plugin:', '');
        this.loadPlugin(plugin);
      }
  
      var spinner = document.createElement('tr');
      spinner.setAttribute('id', 'spinner');
      spinner.innerHTML = '<td colspan="'+(repoHeads.length+2)+'"><img src="images/loading_bar.gif" /></td>';
    
      if (org) {
        reposTableBody.appendChild(spinner);
        reposFunc = gh_user.orgRepos;
        gh_user.orgRepos(account, listRepos);
      } else if (user) {
        reposTableBody.appendChild(spinner);
        reposFunc = gh_user.userRepos;
        gh_user.userRepos(account, listRepos);
      } else {
        dispError('You must specify a user or org.');
      }
    
      sorttable.makeSortable(reposTable);
      this.sortByState();
    };

    // Main
    token = readCookie('access_token');
    if (token && autoload) {
      this.load(token);
    }
 
    /* Dashboard functions */
    
    // Called by authentication callback
    var self = this;
    window.authComplete = function(token, scope) {
      addCookie('access_token', token, 1);
      if (autoload) {
        self.load(token, scope);
      }
    }
  };

  if (typeof exports !== 'undefined') {
    // GHDashboard = exports;
    module.exports = GHDashboard;
    module.exports = updateRepo;
    module.exports = listRepos;
    module.exports = readCookie;
    module.exports = addCookie;
    module.exports = worstState;
  } else {
    window.GHDashboard = GHDashboard;
    window.updateRepo = updateRepo;
    window.listRepos = listRepos;
    window.readCookie = readCookie;
    window.addCookie = addCookie;
    window.worstState = worstState;
  }
}).call(this);
