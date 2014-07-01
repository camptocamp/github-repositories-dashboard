dashboard.priv = function(repo) {
  var html = repo.private ? '<i class="fa fa-lock"></i>' : '';
  updateCell(repo.name, 'priv', html);
}
