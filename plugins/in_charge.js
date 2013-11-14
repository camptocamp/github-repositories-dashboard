// See data/in_charge.json for a sample file
dashboard.in_charge = function(repo) {
  getInChargeList(function(err, in_charge) {
    if (err) {
      updateCell(repo.name, 'in_charge', 'ERR', 'warn');
    } else {
      var html;
      var status;
      if (repo.name in in_charge && in_charge[repo.name]) {
        var username = in_charge[repo.name];
        gh_user.show(username, function(err, user) {
          if (err) {
            html = 'Unknown user: '+username;
            status = 'err';
          } else {
            var avatar = '<img src="'+user.avatar_url+'" width="30px" />';
            html = '<a href="'+user.html_url+'" title="'+username+'">'+avatar+'</a>';
            status = 'ok';
          }
          updateCell(repo.name, 'in_charge', html, status, username);
        });
      } else {
        updateCell(repo.name, 'in_charge', 'NOONE', 'warn');
      }
    }
  });
}

function getInChargeList(cb) {
  function getURL() {
    return 'data/in_charge.json?'+ (new Date()).getTime();
  }

  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', getURL(), true);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status >= 200 && this.status < 300 || this.status === 304) {
        cb(null, this.responseText ? JSON.parse(this.responseText) : true, this);
      } else {
        cb({request: this, error: this.status});
      }
    }
  };
  xhr.setRequestHeader('Content-Type','application/json;charset=UTF-8');
  xhr.send();
};
