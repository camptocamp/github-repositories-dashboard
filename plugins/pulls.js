dashboard.pulls = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.listPulls('open', function(err, pulls) {
    var status;
    var customkey = 0;
    html = '<a href="https://github.com/'+account+'/'+repo.name+'/pulls">'+pulls.length+'</a>';
    if (pulls.length > 0) {
      status = 'warn';
      customkey = pulls.length;
    } else {
      status = 'ok';
    }
    updateCell(repo.name, 'pulls', html, status, customkey);
  });
}
