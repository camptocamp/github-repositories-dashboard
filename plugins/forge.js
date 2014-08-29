dashboard.forge = function(repo) {
  plugin_options.forge = plugin_options.forge || {};
  var r = repositories[repo.name]['repo'];
  r.contents('master', 'metadata.json', function(err, contents) {
    if (err) {
      r.contents('master', 'Modulefile', function(err, contents) {
        if (err) {
          // This might be a warning/error at some point
          updateCell(repo.name, 'forge', '');
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
  var forgeAccount = plugin_options.forge.account || m[0];
  // forge.puppetlabs.com doesn't allow CORS, use a proxy
  forgeAPICall('/users/'+forgeAccount+'/modules/'+m[1]+'/releases/find.json', true, function(err, res) {
    if (err) {
      var html = '<span title="Module does not exist on the forge but has metadata file"><i class="fa fa-times"></i></span>';
      updateForgeCell(repo.name, html, 'warn', '4');
    } else {
      checkForgeTags(repo, res.version, 'http://forge.puppetlabs.com'+res.file);
    }
  });
};

function checkForgeTags(repo, version, url) {
  // Check if there is a tag for the release
  var tags_r;
  if (repo.fork) {
    tags_r = github.getRepo(repo.parent.owner.login, repo.parent.name);
    tags_r.info = repo.parent;
  } else {
    tags_r = repositories[repo.name]['repo'];
    tags_r.info = repo;
  }
  var html = '<a href="'+url+'">'+version+'</a>';
  tags_r.listTags(function(err, tags) {
    if (err) {
      html += ' <a href="'+tags_r.info.tags_url+'" title="Failed to get tags"><i class="fa fa-warning"></i></a>';
      updateForgeCell(repo.name, html, 'warn', '3');
    } else {
      var version_tag = versionTagURL(tags, version);
      if (version_tag) {
        checkForgeTagsCommits(repo, tags_r, version, url, version_tag);
      } else {
        // No tag found, it's a warning
        html += ' <a href="'+tags_r.info.tags_url+'" title="No matching tag found in repository"><i class="fa fa-warning"></i></a>';
        updateForgeCell(repo.name, html, 'warn', '2');
      }
    }
  });
}

function checkForgeTagsCommits(repo, tags_r, version, url, version_tag) {
  var b = repo.default_branch;
  var html = '<a href="'+url+'">'+version+'</a>';
  html += ' <a href="'+version_tag.url+'" title="Matching tag found in repository"><i class="fa fa-tag"></i></a>';
  var state;
  var customkey;

  // get diff
  tags_r.compare(tags_r.info.owner.login+':'+version_tag.tag, account+':'+b, function(err, diff) {
    if (err) {
      html += ' <span title="Failed get commits since tag"><i class="fa fa-warning"></i></span>';
      updateCell(repo.name, 'status', html, 'err', '15');
    } else {
      if (diff.status == 'ahead') {
        diff_url = diff.html_url;
        html += ' <a href="'+diff_url+'" title="Branch '+b+' is '+diff.ahead_by+' commits ahead of tag '+version+'"><i class="fa fa-angle-double-up"></i></a>';
        state = 'warn';
        customkey = '11';
      } else if (diff.status == 'behind') {
        // /!\ using invertDiffURL from status plugin
        diff_url = invertDiffURL(diff.html_url);
        html += ' <a href="'+diff_url+'" title="Branch '+b+' is '+diff.behind_by+' commits behind of tag '+version+'"><i class="fa fa-angle-double-down"></i></a>';
        state = 'warn';
        customkey = '12';
      } else if (diff.status == 'diverged') {
        diff_url = diff.html_url;
        html += ' <a href="'+diff_url+'" title="Branch '+b+' is '+diff.behind_by+' commits behind and '+diff.ahead_by+' commits ahead of tag '+version+'"><i class="fa fa-code-fork"></i></a>';
      } else if (diff.status == 'identical') {
        html += ' <span title="Branch '+b+' is identical to tag '+version+'"><i class="fa fa-check"></i></span>';
        state = 'ok';
        customkey = '13';
      } else {
        html += ' <span title="Branch '+b+' has comparison status with tag '+version+' set to '+diff.status+'"><i class="fa fa-warning"></i></span>';
        state = 'unknown';
        customkey = '14';
      }
    }
    updateForgeCell(repo.name, html, state, customkey);
  });
}

function updateForgeCell(name, html, state, customkey) {
  updateCell(name, 'forge', html, state, customkey);
}

function versionTagURL(tags, version) {
  for (var i=0; i<tags.length; i++) {
    if (tags[i].name == version || tags[i].name == 'v'+version) {
      return { 'url': tags[i].commit.url, 'tag': tags[i].name };
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
