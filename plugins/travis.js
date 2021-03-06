dashboard.travis = function(repo) {
  var status = 'unknown';
  if (repo.private) {
    var access_token = readCookie('travis_access_token');
    if (access_token) {
      getTravisStatus(repo, true, access_token);
    } else {
      var gh_token = readCookie('access_token');
      travisAPICall('/auth/github', {"github_token": gh_token}, true, 'POST', null, false, function(err, res) {
        access_token = res.access_token;
        addCookie('travis_access_token', access_token, 1);
        getTravisStatus(repo, true, access_token);
      });
    }
  } else {
    getTravisStatus(repo, false, null);
  }
}

// Limit state to warning if repo is a fork
function travisMungeState(repo, state) {
  if (repo.fork && state == 'err') {
    return 'warn';
  } else {
    return state;
  }
}

function getTravisStatus(repo, priv, travis_token) {
  travisAPICall('/repos/'+account+'/'+repo.name+'/branches/'+repo.default_branch, null, priv, 'GET', travis_token, false, function(err, res) {
    var msg;
    var customkey;
    var image;
    if (err) {
      msg = 'Error while getting Travis status';
      status = 'err';
      customkey = '9';
      image = null;
    } else {
      var date = new Date(res.branch.started_at);
      var date_str = ' on '+date.toLocaleDateString()+' at '+date.toLocaleTimeString();
      msg = 'Last build state: '+res.branch.state+' (build #'+res.branch.number+date_str+')';
      switch (res.branch.state) {
        case 'passed':
          status = 'ok';
          customkey = '0';
          image = 'passing';
          break;
        case 'failed':
          status = travisMungeState(repo, 'err');
          customkey = '1';
          image = 'failing';
          break;
        case 'errored':
          status = travisMungeState(repo, 'err');
          customkey = '2';
          image = 'error';
          break;
        case 'created':
          status = 'warn';
          customkey = '3';
          image = 'pending';
          break;
        case 'canceled':
          status = 'warn';
          customkey = '4';
          image = 'canceled';
          break;
        default:
          status = 'unknown';
          customkey = '5';
          image = 'unknown';
          break;
      }
    }
    var api = travisURL(priv);
    updateTravisCell(repo.name, 'https://'+api+'/', repo.default_branch, travis_token, msg, status, image, customkey);
  });
}

function travisAPICall(path, data, priv, verb, travis_token, use_corsproxy, cb) {
  var xhr = new XMLHttpRequest();
  var api = travisAPIURL(priv);
  var url;
  if (use_corsproxy) {
    url = 'http://www.corsproxy.com/'+api+path+'?'+ (new Date()).getTime(); 
  } else {
    url = 'https://'+api+path+'?'+ (new Date()).getTime(); 
  }
  xhr.dataType = "json";
  xhr.open(verb, url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status >= 200 && this.status < 300 || this.status === 304) {
        cb(null, this.responseText ? JSON.parse(this.responseText) : true, this);
      } else {
        cb({path: path, request: this, error: this.status});
      }
    }
  }
  xhr.setRequestHeader('Accept','application/vnd.travis-ci.2+json');
  xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
  if (travis_token) {
    xhr.setRequestHeader('Authorization','token "'+travis_token+'"');
  }
  data ? xhr.send(JSON.stringify(data)) : xhr.send();
}

function travisAPIURL(priv) {
  if (priv) {
    return 'api.travis-ci.com';
  } else {
    return 'api.travis-ci.org';
  }
}

function travisURL(priv) {
  if (priv) {
    return 'magnum.travis-ci.com';
  } else {
    return 'travis-ci.org';
  }
}

function updateTravisCell(name, travis_url, branch, travis_token, msg, status, image, customkey) {
  var html = '<a href="'+travis_url+account+'/'+name+'">';
  if (image) {
    var image_src = 'images/travis/'+image+'.svg';
    html += '<img src="'+image_src+'" title="'+msg+' (state='+status+')" />';
  } else {
    html += '<span title="'+msg+'">'+status+'</span>';
  }
  html += '</a>';
  updateCell(name, 'travis', html, status, customkey);
}

