dashboard.r_origin = function(name) {
  repositories[name]['repo'].show(updateOriginStatus);
}

// managed by r_origin
dashboard.r_status = function(name) {}

function updateOriginStatus(err, repo) {
  updateOrigin(repo);
  updateForkStatus(repo);
}

function updateOrigin(repo) {
  info = repositories[repo.name]['info'];
  if (info.fork) {
    var p = repo.parent;
    updateCell(repo.name, 'origin', '<a href="'+p.html_url+'">'+p.owner.login+'/'+p.name+'</a>');
  } else {
    updateCell(repo.name, 'origin', 'N/A');
  }
}

function updateForkStatus(repo) {
  info = repositories[repo.name]['info'];
  if (info.fork) {
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
  } else {
    updateCell(repo.name, 'status', 'N/A');
  }
}
