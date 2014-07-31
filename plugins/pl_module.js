dashboard.pl_module = function(repo) {
  var m = repo.name.split('-');
  var r = github.getRepo('puppetlabs', 'puppetlabs-'+m[1]);
  r.show(function(err, info) {
    var html;
    var customkey;
    if (err) {
      html = '';
      customkey = '0';
    } else {
      html = '<a href="'+info.html_url+'"><i class="fa fa-external-link"></i></a>';
      html += ' <a href="'+info.html_url+'/network">('+info.forks_count+')</a>';
      customkey = '1';
    }
    updateCell(repo.name, 'pl_module', html, null, customkey);
  });
}
