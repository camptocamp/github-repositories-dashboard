dashboard.coveralls = function(repo) {
  // TODO: Use API to retrieve actually percentage?
  var name = repo.name;
  var link = 'https://coveralls.io/r/'+account+'/'+name;
  var image_src = 'https://coveralls.io/repos/'+account+'/'+name+'/badge.png';
  var html = '<a href="'+link+'"><img src="'+image_src+'" title="Coverage badge" /></a>';
  updateCell(name, 'coveralls', html); 
}
