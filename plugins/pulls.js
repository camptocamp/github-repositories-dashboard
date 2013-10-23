dashboard.pulls = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.listPulls('open', function(err, pulls) {
    html = '<a href="https://github.com/'+account+'/'+repo.name+'/pulls">'+pulls.length+'</a>';
    updateCell(repo.name, 'pulls', html);
  });
}
