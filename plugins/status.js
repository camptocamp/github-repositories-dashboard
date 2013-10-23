dashboard.status = function(repo) {
  if (repo.fork) {
    var p = repo.parent;
    var r = repositories[repo.name]['repo'];

    // get diff
    r.compare(p.owner.login+':master', account+':master', function(err, diff) {
      if (err) {
        updateCell(repo.name, 'status', 'ERR');
      } else {
        var diff_msg;
        var state = 'ok';
        if (diff.status == 'ahead') {
          diff_msg = diff.status + ' ('+diff.ahead_by+' commits)';
          state = 'warn';
        } else if (diff.status == 'behind') {
          diff_msg = diff.status + ' ('+diff.behind_by+' commits)';
          state = 'warn';
        } else if (diff.status == 'diverged') {
          diff_msg = diff.status + ' ('+diff.behind_by+' behind and '+diff.ahead_by+' ahead)';
          state = 'err';
        } else {
          diff_msg = diff.status;
        }
        html = '<a href="'+diff.html_url+'">'+diff_msg+'</a>';
        updateCell(repo.name, 'status', html, state);
      }
    });
  } else {
    updateCell(repo.name, 'status', 'N/A');
  }
}
