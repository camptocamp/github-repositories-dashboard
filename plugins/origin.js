dashboard.origin = function(repo) {
  if (repo.fork) {
    var p = repo.parent;
    updateCell(repo.name, 'origin', '<a href="'+p.html_url+'">'+p.owner.login+'/'+p.name+'</a>');
  } else {
    updateCell(repo.name, 'origin', 'N/A');
  }
}
