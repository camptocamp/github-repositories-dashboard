dashboard.r_travis = function(name) {
  info = repositories[name]['info'];
  var travis_url;
  if (info.private) {
    travis_url = 'https://magnum.travis-ci.com/';
  } else {
    travis_url = 'https://travis-ci.org/';
  }
  html = '<a href="'+travis_url+org+'/'+name+'"><img src="'+travis_url+org+'/'+name+'.png#'+new Date().getTime()+'" /></a>';
  updateCell(name, 'travis', html);
}
