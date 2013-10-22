dashboard.pulls = function(name) {
  var r = repositories[name]['repo'];
  r.listPulls('open', function(err, pulls) {
    html = '<a href="https://github.com/'+account+'/'+name+'/pulls">'+pulls.length+'</a>';
    updateCell(name, 'pulls', html);
  });
}
