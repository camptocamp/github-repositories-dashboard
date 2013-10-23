dashboard.forge = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.contents('master', 'Modulefile', function(err, contents) {
    if (err) {
      updateCell(repo.name, 'forge', 'N/A');
    } else {
      updateForge(repo.name, contents);
    }
  }, false);
};

function updateForge(name, contents) {
  var matches = contents.match(/name\s+(?:["'])(\S+)(?:["\'])/);
  var module = matches[1];
  var m = module.split('-');
  // forge.puppetlabs.com doesn't allow CORS, use a proxy
  _request('GET', 'http://www.corsproxy.com/forge.puppetlabs.com/users/'+m[0]+'/modules/'+m[1]+'/releases/find.json', null, function(err, res) {
    if (err) {
      updateCell(name, 'forge', 'ERR');
    } else {
      var html = '<a href="'+res.file+'">http://forge.puppetlabs.com'+res.version+'</a>';
      updateCell(name, 'forge', html);
    }
  });
};

function _request(method, path, data, cb, raw, sync) {
  function getURL() {
    var url = path.indexOf('//') >= 0 ? path : API_URL + path;
    return url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime();
  }

  var xhr = new XMLHttpRequest();
  if (!raw) {xhr.dataType = "json";}

  xhr.open(method, getURL(), !sync);
  if (!sync) {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status >= 200 && this.status < 300 || this.status === 304) {
          cb(null, raw ? this.responseText : this.responseText ? JSON.parse(this.responseText) : true, this);
        } else {
          cb({path: path, request: this, error: this.status});
        }
      }
    }
  };
  xhr.setRequestHeader('Accept','application/vnd.github.raw+json');
  xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
  data ? xhr.send(JSON.stringify(data)) : xhr.send();
  if (sync) return xhr.response;
};
