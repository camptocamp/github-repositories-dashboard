dashboard.status = function(repo) {
  if (repo.fork) {
    var p = repo.parent;
    var r = repositories[repo.name]['repo'];
    var b = repo.default_branch;

    // get diff
    r.compare(p.owner.login+':'+b, account+':'+b, function(err, diff) {
      if (err) {
        updateCell(repo.name, 'status', 'ERR', 'err');
      } else {
        var diff_msg;
        var state = 'ok';
        if (diff.status == 'ahead') {
          diff_msg = '<i class="fa fa-angle-double-up"></i> ('+diff.ahead_by+')';
          state = 'warn';
        } else if (diff.status == 'behind') {
          diff_msg = '<i class="fa fa-angle-double-down"></i> ('+diff.behind_by+')';
          state = 'warn';
        } else if (diff.status == 'diverged') {
          diff_msg = '<i class="fa fa-code-fork"></i> ('+diff.behind_by+')('+diff.ahead_by+')';
          state = 'err';
        } else {
          diff_msg = diff.status;
        }
        html = '<a href="'+diff.html_url+'">'+diff_msg+'</a>';
        updateCell(repo.name, 'status', html, state);
      }
    });
  } else {
    updateCell(repo.name, 'status', '');
  }
}
