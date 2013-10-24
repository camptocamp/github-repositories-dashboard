dashboard.travis = function(repo) {
  var travis_url;
  var status = 'unknown';
  if (repo.private) {
    updateTravisCell(repo.name, 'https://magnum.travis-ci.com/', '', status);
  } else {
    travisAPICall('/repos/'+account+'/'+repo.name, function(err, res) {
      var msg;
      if (err) {
        msg = 'Error while getting Travis status';
        status = 'warn';
      } else {
        msg = 'Last build state: '+res.repo.last_build_state;
        switch (res.repo.last_build_state) {
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
      updateTravisCell(repo.name, 'https://travis-ci.org/', msg, status);
    });
  }
}

function updateTravisCell(name, travis_url, msg, status) {
  html = '<a href="'+travis_url+account+'/'+name+'">';
  html += '<img src="'+travis_url+account+'/'+name+'.png#'+new Date().getTime()+'" title="'+msg+'" />';
  html += '</a>';
  updateCell(name, 'travis', html, status);
}

function travisAPICall(path, cb) {
  var xhr = new XMLHttpRequest();
  var url = 'https://api.travis-ci.org'+path+'?'+ (new Date()).getTime(); 
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status >= 200 && this.status < 300 || this.status === 304) {
        cb(null, this.responseText ? JSON.parse(this.responseText) : true, this);
      } else {
        cb({path: path, request: this, error: this.status});
      }
    }
  }
  xhr.setRequestHeader('Accept','application/json; version=2');
  xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
  setRequestHeader('User-Agent','github-repositories-dashboard/0.1');
  xhr.send();
}

