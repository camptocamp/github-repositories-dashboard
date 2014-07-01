dashboard.priv = function(repo) {
  var html = repo.private ? '<img src="images/lock.png" width="30px" />' : '';
  updateCell(repo.name, 'priv', html);
}
