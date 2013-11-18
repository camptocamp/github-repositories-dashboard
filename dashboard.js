/* Main */

// query params
var org = getParameterByName('org');
var user = getParameterByName('user');
var refresh = getParameterByName('refresh') || 600000; // 10 minutes
var refresh_randomize = getParameterByName('refresh_randomize') || 0.5; // up to 15 minutes
var filter = getParameterByName('filter');

var github;
var gh_user;
var reposFunc;
var dashboard = new Object();
var repositories;
var repoHeads;
var account = org || user;
var sortTimeout;

// Main
var token = readCookie('access_token');
loadPage(token);

/* Dashboard functions */

// Called by authentication callback
window.authComplete = function(token) {
  createCookie('access_token', token, 1);
  loadPage(token);
}

function loadPage(token) {
  if (token) {
    document.getElementById('auth_link').style.display = 'none';
    document.getElementById('auth_remove').style.display = 'inline-block';
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
    loadPlugin(plugin);
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
  sortByState();
}

function authRemove() {
  eraseCookie('access_token');
  window.location.reload();
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
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

function updateCell(repo, cell, value, state, customkey) {
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

function refreshSortTimeout () {
  clearTimeout(sortTimeout);
  sortTimeout = setTimeout(function() {refreshSort()}, 500);
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
}

// TODO: give a numerical weight to each line
function stateToNum(state) {
  switch (state) {
    case 'err':
      return 1000;
    case 'warn':
      return 100;
    case 'ok':
      return 10;
    default:
      return 0;
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

function sortByState() {
  var reposTable = document.getElementById('repositories');
  var heads = reposTable.getElementsByTagName('th');
  var refreshTH = heads[heads.length-1];
  sorttable.innerSortFunction.apply(refreshTH, []);
  // Twice, to sort by reverse order
  sorttable.innerSortFunction.apply(refreshTH, []);
}

function refreshList() {
  reposFunc(account, listRepos);
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
    } else if (heads[i].className.match(/\bsorttable_([a-z0-9]+)\b/)) {
      // first sort by name
      sorttable.innerSortFunction.apply(heads[0], []);
      sorttable.innerSortFunction.apply(heads[i], []);
      break;
    }
  }
}

// Plugins
function loadPlugin(plugin) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'plugins/'+plugin+'.js'; 
  document.body.appendChild(script);
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
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
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
