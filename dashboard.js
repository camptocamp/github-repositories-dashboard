/* Main */

// query params
var org = getParameterByName('org') || 'camptocamp';
var refresh = getParameterByName('refresh') || 60000; // 1 minutes
var refresh_randomize = getParameterByName('refresh_randomize') || 0.5; // up to 2 minutes
var filter = getParameterByName('filter');

var github;
var dashboard = new Object();
var repositories = {};
var repoHeads = [];

// Main
var token = readCookie('access_token');
if (token) loadPage(token);

/* Dashboard functions */

// Called by authentication callback
window.authComplete = function(token) {
  createCookie('access_token', token, 1);
  loadPage(token);
}

function loadPage(token) {
  document.getElementById('auth_link').style.display = 'none';
  document.getElementById('auth_remove').style.display = 'block';
  github = new Github({
    token: token
  });

  var user = github.getUser();

  var reposTable = document.getElementById('repositories');
  var reposTableBody = document.getElementsByTagName('tbody')[0];

  // Get heads
  var headElems = reposTable.getElementsByTagName('th');
  for (var i=0; i<headElems.length; i++) {
    classes = headElems[i].className.split(' ');
    for (var j=0; j<classes.length; j++) {
      if (classes[j].match(/^r_/) &&
          classes[j] != 'r_name' &&
          classes[j] != 'r_refresh') {
            repoHeads.push(classes[j]);
          }
    }
  }

  var spinner = document.createElement('tr');
  spinner.setAttribute('id', 'spinner');
  spinner.innerHTML = '<td colspan="'+(repoHeads.length+2)+'"><img src="images/loading.gif" /></td>';
  reposTableBody.appendChild(spinner);

  user.orgRepos(org, listRepos);
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
  var reposTable = document.getElementById('repositories');
  var reposTableBody = document.getElementsByTagName('tbody')[0];

  var spinner = document.getElementById('spinner');
  spinner.style.display = 'none';

  for (var i=0; i<repos.length; i++) {
    var name = repos[i].name;
    if (filter) {
      filterReg = new RegExp(filter);
      if (! name.match(filterReg)) continue;
    }
    var repoLine = document.createElement('tr');
    repoLine.setAttribute('id', name);
    reposTableBody.appendChild(repoLine);
    repositories[name] = {};
    repositories[name]['info'] = repos[i];

    initRepo(name, repoHeads);
    updateRepo(name);
  }

  sorttable.makeSortable(reposTable);
  var nameElem = reposTable.getElementsByTagName('th')[0];
  sorttable.innerSortFunction.apply(nameElem);
}

function initRepo(name, heads) {
  info = repositories[name]['info'];
  html = '<td class="r_name"><a href="'+info.html_url+'">'+name+'</a></td>';

  for (i=0; i<heads.length; i++) {
    html += '<td class="'+heads[i]+'"><img src="images/loading.gif" width="30px" /></td>';
  }

  html += '<td class="r_refresh"><a href="javascript:updateRepo(\''+name+'\')"><img src="images/refresh.jpg" width="20px" /></a></td>';
  document.getElementById(name).innerHTML = html;
}

function updateRepo(name) {
  var r = github.getRepo(org, name);
  repositories[name]['repo'] = r;

  // refresh all cells
  for (i=0; i<repoHeads.length; i++) {
    dashboard[repoHeads[i]](name);
  }

  // auto-refresh
  if (refresh > 0) {
    refresh_time = refresh + Math.random()*refresh*refresh_randomize;
    setTimeout(function() {updateRepo(name)}, refresh_time);
  }
}

function updateCell(repo, cell, value) {
  var repoLine = document.getElementById(repo);
  repoLine.getElementsByClassName('r_'+cell)[0].innerHTML = value;
}

dashboard.r_origin = function(name) {
  repositories[name]['repo'].show(updateOriginStatus);
}

// managed by r_origin
dashboard.r_status = function(name) {}

function updateOriginStatus(err, repo) {
  info = repositories[repo.name]['info'];

  // check fork
  if (info.fork) {
    updateOrigin(repo);
    updateForkStatus(repo);
  } else {
    updateCell(repo.name, 'origin', 'N/A');
    updateCell(repo.name, 'status', 'N/A');
  }
}

function updateOrigin(repo) {
  var p = repo.parent;
  updateCell(repo.name, 'origin', '<a href="'+p.html_url+'">'+p.owner.login+'/'+p.name+'</a>');
}

function updateForkStatus(repo) {
  var p = repo.parent;
  var r = repositories[repo.name]['repo'];

  // get diff
  r.compare(p.owner.login+':master', org+':master', function(err, diff) {
    if (err) {
      updateCell(repo.name, 'status', 'ERR');
    } else {
      var diff_msg;
      if (diff.status == 'ahead') {
        diff_msg = diff.status + ' ('+diff.ahead_by+' commits)';
      } else if (diff.status == 'behind') {
        diff_msg = diff.status + ' ('+diff.behind_by+' commits)';
      } else if (diff.status == 'diverged') {
        diff_msg = diff.status + ' ('+diff.behind_by+' behind and '+diff.ahead_by+' ahead)';
      } else {
        diff_msg = diff.status;
      }
      html = '<a href="'+diff.html_url+'">'+diff_msg+'</a>';
      updateCell(repo.name, 'status', html);
    }
  });
}

dashboard.r_hooks = function(name) {
  var r = repositories[name]['repo'];
  r.listHooks(function(err, hooks) {
    console.log(hooks);
  });
}

dashboard.r_pulls = function(name) {
  var r = repositories[name]['repo'];
  r.listPulls('open', function(err, pulls) {
    html = '<a href="https://github.com/'+org+'/'+name+'/pulls">'+pulls.length+'</a>';
    updateCell(name, 'pulls', html);
  });
}

dashboard.r_travis = function(name) {
  info = repositories[name]['info'];
  var travis_url;
  if (info.private) {
    travis_url = 'https://magnum.travis-ci.com/';
  } else {
    travis_url = 'https://travis-ci.org/';
  }
  html = '<a href="'+travis_url+org+'/'+name+'"><img src="'+travis_url+org+'/'+name+'.png#'+new Date().getTime()+'" /></a>';
  updateCell(name, 'travis', html);
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
