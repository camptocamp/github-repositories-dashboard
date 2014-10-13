dashboard.forks = function(repo) {
  var title = repo.forks_count+' forks';
  var html = '<a href="'+repo.html_url+'/network" title="'+title+'">'+repo.forks_count+'</a>';
  updateCell(repo.name, 'forks', html, null, repo.forks_count);
}
