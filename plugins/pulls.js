dashboard.pulls = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.listPulls('open', function(err, pulls) {
    var status;
    html = '<a href="https://github.com/'+account+'/'+repo.name+'/pulls">'+pulls.length+'</a>';
    if (pulls.length > 0) {
      status = 'warn';
    } else {
      status = 'ok';
    }
    updateCell(repo.name, 'pulls', html, status, pulls.length);
  });
}
