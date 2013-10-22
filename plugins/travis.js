dashboard.travis = function(name) {
  info = repositories[name]['info'];
  var travis_url;
  if (info.private) {
    travis_url = 'https://magnum.travis-ci.com/';
  } else {
    travis_url = 'https://travis-ci.org/';
  }
  html = '<a href="'+travis_url+account+'/'+name+'"><img src="'+travis_url+account+'/'+name+'.png#'+new Date().getTime()+'" /></a>';
  updateCell(name, 'travis', html);
}
