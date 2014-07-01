dashboard.priv = function(repo) {
  if (repo.private) {
    updateCell(repo.name, 'priv', '<img src="images/lock.png" />');
  }
}
