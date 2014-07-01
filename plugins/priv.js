dashboard.priv = function(repo) {
  var html = repo.private ? '<i class="fa fa-lock"></i>' : '';
  var customkey = repo.private ? '1' : '0';
  updateCell(repo.name, 'priv', html, null, customkey);
}
