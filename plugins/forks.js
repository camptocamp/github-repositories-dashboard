dashboard.forks = function(repo) {
  var html = '<a href="https://github.com/'+account+'/'+repo.name+'/forks">'+repo.forks_count+'</a>';
  updateCell(repo.name, 'forks', html);
}
