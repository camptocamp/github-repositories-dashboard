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
        var diff_url;
        if (diff.status == 'ahead') {
          diff_msg = '<span title="'+diff.ahead_by+' commits ahead"><i class="fa fa-angle-double-up"></i> ('+diff.ahead_by+')</span>';
          diff_url = diff.html_url;
          html = '<a href="'+diff_url+'">'+diff_msg+'</a>';
          state = 'warn';
          customkey = '3';
        } else if (diff.status == 'behind') {
          diff_msg = '<span title="'+diff.behind_by+' commits behind"><i class="fa fa-angle-double-down"></i> ('+diff.behind_by+')</span>';
          diff_url = invertDiffURL(diff.html_url);
          html = '<a href="'+diff_url+'">'+diff_msg+'</a>';
          state = 'ok';
          customkey = '2';
        } else if (diff.status == 'diverged') {
          ahead_url = diff.html_url;
          behind_url = invertDiffURL(diff.html_url);
          html = '<span title="'+diff.behind_by+' commits behind and '+diff.ahead_by+' commits ahead"><i class="fa fa-code-fork"></i></span> ';
          html += '<a href="'+behind_url+'" title="'+diff.behind_by+' commits behind">('+diff.behind_by+')</a> ';
          html += '<a href="'+ahead_url+'" title="'+diff.ahead_by+' commits ahead">('+diff.ahead_by+')</a>';
          state = 'err';
          customkey = '1';
        } else if (diff.status == 'identical') {
          diff_msg = '<i class="fa fa-check" title="identical"></i>';
          html = diff_msg;
          state = 'ok';
          customkey = '0';
        } else {
          diff_msg = diff.status;
          html = diff_msg;
          customkey = '4';
        }
        updateCell(repo.name, 'status', html, state, customkey);
      }
    });
  } else {
    updateCell(repo.name, 'status', '');
  }
}

function invertDiffURL(url) {
  var base = url.match(/\/([^/]+)\.\.\./);
  return url.replace(base[0], '/')+'...'+base[1];
}
