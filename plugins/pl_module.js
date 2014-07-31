dashboard.pl_module = function(repo) {
  var m = repo.name.split('-');
  var r = github.getRepo('puppetlabs', 'puppetlabs-'+m[1]);
  r.show(function(err, info) {
    var html;
    if (err) {
      html = '';
    } else {
      html = '<a href="'+r.info.html_url+'"><i class="fa fa-external-link"></i></a>';
    }
    updateCell(repo.name, 'pl_module', html);
  });
}
