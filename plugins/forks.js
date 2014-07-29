dashboard.forks = function(repo) {
  var html = '<a href="https://github.com/'+account+'/'+repo.name+'/network">'+repo.forks_count+'</a>';
  updateCell(repo.name, 'forks', html, null, repo.forks_count);
}
