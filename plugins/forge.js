dashboard.forge = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.contents('master', 'metadata.json', function(err, contents) {
    if (err) {
      r.contents('master', 'Modulefile', function(err, contents) {
        if (err) {
          updateCell(repo.name, 'forge', 'N/A');
        } else {
          parseModulefile(repo, contents);
        }
      }, false);
    } else {
      parseMetadataJSON(repo, contents);
    }
  });
};

function parseMetadataJSON(repo, contents) {
  var json = JSON.parse(contents);
  var module = json.name;
  updateForge(repo, module);
}

function parseModulefile(repo, contents) {
  var matches = contents.match(/name\s+(?:["'])([^"']+)(?:["\'])/);
  var module = matches[1];
  updateForge(repo, module);
}

function updateForge(repo, module) {
  var m = module.split('-');
  // forge.puppetlabs.com doesn't allow CORS, use a proxy
  if (m[0] == account) {
    forgeAPICall('/users/'+m[0]+'/modules/'+m[1]+'/releases/find.json', true, function(err, res) {
      if (err) {
        updateCell(repo.name, 'forge', 'ERR');
      } else {
        updateForgeCell(repo, res.version, 'http://forge.puppetlabs.com'+res.file);
      }
    });
  } else {
    updateCell(repo.name, 'forge', '', 'ok');
  }
};

function updateForgeCell(repo, version, url) {
  // Check if there is a tag for the release
  var r = repositories[repo.name]['repo'];
  var html = '<a href="'+url+'">'+version+'</a>';
  var state;
  r.listTags(function(err, tags) {
    if (err) {
      updateCell(repo.name, 'forge', 'Failed to get tags', 'unknown');
    } else {
      var tag_url = versionTagURL(tags, version);
      if (tag_url) {
        // Tag found, add tag and link
        html += ' <a href="'+tag_url+'" title="Matching tag found in repository"><i class="fa fa-tag"></i></a>';
        state = 'ok';
      } else {
        // No tag found, it's a warning
        html += ' <span title="No matching tag found in repository"><i class="fa fa-warning"></i></span>';
        state = 'warn';
      }
    }
  });
  updateCell(repo.name, 'forge', html, state);
}

function versionTagURL(tags, version) {
  for (var i=0; i<tags.length; i++) {
    if (tags[i].name == version) {
      return tags[i].commit.url;
    }
  }
}

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
