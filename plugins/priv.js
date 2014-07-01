dashboard.priv = function(repo) {
  var html = repo.private ? '<i class="fa fa-lock fa-2x"></i>' : '';
  updateCell(repo.name, 'priv', html);
}
