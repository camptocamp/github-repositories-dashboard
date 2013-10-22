/* Dashboard functions */

function listRepos(err, repos) {
  var reposTable = document.getElementById('repositories');
  for (var i=0; i<repos.length; i++) {
    var name = repos[i].name;
    if (! name.match(/^puppet-/)) continue;
    var repoLine = document.createElement('tr');
    repoLine.setAttribute('id', name);
    reposTable.appendChild(repoLine);
    repositories[name] = {};
    repositories[name]['info'] = repos[i];
    initRepo(name);
    updateRepo(name);
  }
}

function initRepo(name) {
  info = repositories[name]['info'];
  html = '<td class="r_name">'+name+'</td>';
  html += '<td class="r_origin"><img src="images/loading.gif" width="30px" /></td>';
  html += '<td class="r_status"><img src="images/loading.gif" width="30px" /></td>';
  html += '<td class="r_pulls"><img src="images/loading.gif" width="30px" /></td>';
  var travis_url;
  if (info.private) {
    travis_url = 'https://magnum.travis-ci.com/';
  } else {
    travis_url = 'https://travis-ci.org/';
  }
  html += '<td class="r_travis"><a href="'+travis_url+org+'/'+name+'"><img src="'+travis_url+org+'/'+name+'.png#'+new Date().getTime()+'" /></a></td>';
  // forge: version on the forge, if any (see https://projects.puppetlabs.com/projects/module-site/wiki/Server-api)
  // hooks: which hooks are configured
  html += '<td class="r_refresh"><a href="javascript:updateRepo(\''+name+'\')"><img src="images/refresh.jpg" width="20px" /></a></td>';
  document.getElementById(name).innerHTML = html;
}

function updateRepo(name) {
  var r = github.getRepo(org, name);
  repositories[name]['repo'] = r;
  r.show(updateOriginStatus);

  // check hooks
  //updateHooksStatus(name);
  updatePullsStatus(name);
  updateTravisStatus(name);

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
  updateCell(repo.name, 'origin', p.owner.login+'/'+p.name);
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

function updateHooksStatus(name) {
  var r = repositories[name]['repo'];
  r.listHooks(function(err, hooks) {
    console.log(hooks);
  });
}

function updatePullsStatus(name) {
  var r = repositories[name]['repo'];
  r.listPulls('open', function(err, pulls) {
    html = '<a href="https://github.com/'+org+'/'+name+'/pulls">'+pulls.length+'</a>';
    updateCell(name, 'pulls', html);
  });
}

function updateTravisStatus(name) {
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
