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
      text = issues.length;
      customkey = issues.length;
      if (issues.length > 0) {
        status = 'warn';
      } else {
        status = 'ok';
      }
    }
    html = '<a href="https://github.com/'+account+'/'+repo.name+'/issues" title="'+title+'">'+text+'</a>';
    updateCell(repo.name, 'issues', html, status, customkey);
  });
}

