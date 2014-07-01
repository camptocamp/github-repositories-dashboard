dashboard.travis = function(repo) {
  var status = 'unknown';
  if (repo.private) {
    travisAPICall('/auth/github', {"github_token": token}, true, 'POST', null, false, function(err, res) {
      getTravisStatus(repo, true, res.access_token);
    })
  } else {
    getTravisStatus(repo, false, null);
  }
}

function getTravisStatus(repo, priv, travis_token) {
  travisAPICall('/repos/'+account+'/'+repo.name+'/branches/'+repo.default_branch, null, priv, 'GET', travis_token, false, function(err, res) {
    var msg;
    if (err) {
      msg = 'Error while getting Travis status';
      status = 'unknown';
    } else {
      var date = new Date(res.branch.started_at);
      var date_str = ' on '+date.toLocaleDateString()+' at '+date.toLocaleTimeString();
      msg = 'Last build state: '+res.branch.state+' (build #'+res.branch.number+date_str+')';
      switch (res.branch.state) {
        case 'passed':
          status = 'ok';
          break;
        case 'failed':
          status = 'err';
          break;
        default:
          status = 'unknown';
          break;
      }
    }
    var api = travisURL(priv);
    updateTravisCell(repo.name, 'https://'+api+'/', repo.default_branch, travis_token, msg, status);
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

function updateTravisCell(name, travis_url, branch, travis_token, msg, status) {
  var image_src = "images/travis/";
  switch (status) {
    'ok':
      image_src += "passing.png";
    'err':
      image_src += "failing.png";
    default:
      image_src += "unknown.png";
  }
  var html = '<a href="'+travis_url+account+'/'+name+'">';
  html += '<img src="'+image_src+'" title="'+msg+' (state='+status+')" />';
  html += '</a>';
  updateCell(name, 'travis', html, status);
}

