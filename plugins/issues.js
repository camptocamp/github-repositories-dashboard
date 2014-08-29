dashboard.issues = function(repo) {
  github.getIssues(account, repo.name).list(null, function(err, issues) {
    var status;
    var text;
    var title;
    var customkey = 0;
    if (err) {
      title = JSON.parse(err.request.response).message;
      if (err.error == 410) {
        text = 'N/A';
        status = 'ok';
      } else {
        text = 'ERR';
        status = 'warn';
      }
    } else {
      var l = 0;
      for (var i=0; i < issues.length; i++) {
        if (issues[i].pull_request) {
          l++;
        }
      }
      text = l;
      customkey = l;
      if (l > 0) {
        status = 'warn';
      } else {
        status = 'ok';
      }
    }
    html = '<a href="https://github.com/'+account+'/'+repo.name+'/issues" title="'+title+'">'+text+'</a>';
    updateCell(repo.name, 'issues', html, status, customkey);
  });
}

