dashboard.forge = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.contents('master', 'Modulefile', function(err, contents) {
    if (err) {
      updateCell(repo.name, 'forge', 'N/A');
    } else {
      parseModulefile(repo.name, contents);
    }
  }, false);
};

function parseMetadataJSON(name, contents) {
  console.log("not implemented");
}

function parseModulefile(name, contents) {
  var matches = contents.match(/name\s+(?:["'])([^"']+)(?:["\'])/);
  var module = matches[1];
  updateForge(name, module);
}

function updateForge(name, module) {
  var m = module.split('-');
  // forge.puppetlabs.com doesn't allow CORS, use a proxy
  if (m[0] == account) {
    forgeAPICall('/users/'+m[0]+'/modules/'+m[1]+'/releases/find.json', true, function(err, res) {
      if (err) {
        updateCell(name, 'forge', 'ERR');
      } else {
        var html = '<a href="http://forge.puppetlabs.com'+res.file+'">'+res.version+'</a>';
        updateCell(name, 'forge', html);
      }
    });
  } else {
    updateCell(name, 'forge', 'N/A', 'ok');
  }
};

function forgeAPICall(path, use_corsproxy, cb) {
  function getURL() {
    if (use_corsproxy) {
      return 'http://www.corsproxy.com/forge.puppetlabs.com'+path+'?'+ (new Date()).getTime();
    } else {
      return 'http://forge.puppetlabs.com'+path+'?'+ (new Date()).getTime();
    }
  }

  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', getURL(), true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status >= 200 && this.status < 300 || this.status === 304) {
        cb(null, this.responseText ? JSON.parse(this.responseText) : true, this);
      } else {
        cb({path: path, request: this, error: this.status});
      }
    }
  };
  xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
  xhr.send();
};
