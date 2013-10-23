dashboard.travis = function(repo) {
  var travis_url;
  if (repo.private) {
    travis_url = 'https://magnum.travis-ci.com/';
  } else {
    travis_url = 'https://travis-ci.org/';
  }
  html = '<a href="'+travis_url+account+'/'+repo.name+'"><img src="'+travis_url+account+'/'+repo.name+'.png#'+new Date().getTime()+'" /></a>';
  updateCell(repo.name, 'travis', html);
}
