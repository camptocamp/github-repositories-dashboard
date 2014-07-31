dashboard.forks = function(repo) {
  var html = '<a href="'+repo.html_url+'/network">'+repo.forks_count+'</a>';
  updateCell(repo.name, 'forks', html, null, repo.forks_count);
}
