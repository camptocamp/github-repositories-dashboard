dashboard.last_committer = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.getCommits(null, function(err, commits) {
    var commit = commits[0];

    var html = '';
    var status = 'unknown';
    var login = null;

    if (commit.committer) {
      var avatar = '<img src="'+commit.committer.avatar_url+'" width="30px" />';
      html = '<a href="'+commit.committer.html_url+'">'+avatar+'</a>';
      login = commit.committer.login;
    }

    updateCell(repo.name, 'last_committer', html, status, login);
  });
}
