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
        var customkey;
        if (diff.status == 'ahead') {
          diff_msg = '<i class="fa fa-angle-double-up" title="'+diff.ahead_by+' commits ahead"></i> ('+diff.ahead_by+')';
          state = 'warn';
          customkey = '3';
        } else if (diff.status == 'behind') {
          diff_msg = '<i class="fa fa-angle-double-down" title="'+diff.behind_by+' commits behind"></i> ('+diff.behind_by+')';
          state = 'warn';
          customkey = '2';
        } else if (diff.status == 'diverged') {
          diff_msg = '<i class="fa fa-code-fork" title="'+diff.behind_by+' commits behind and '+diff.ahead_by+' commits ahead"></i> ('+diff.behind_by+')('+diff.ahead_by+')';
          state = 'err';
          customkey = '1';
        } else if (diff.status == 'identical') {
          diff_msg = '<i class="fa fa-check" title="identical"></i>';
          state = 'ok';
          customkey = '0';
        } else {
          diff_msg = diff.status;
          customkey = '4';
        }
        html = '<a href="'+diff.html_url+'">'+diff_msg+'</a>';
        updateCell(repo.name, 'status', html, state, customkey);
      }
    });
  } else {
    updateCell(repo.name, 'status', '');
  }
}
