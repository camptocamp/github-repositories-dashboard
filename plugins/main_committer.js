dashboard.main_committer = function(repo) {
  var r = repositories[repo.name]['repo'];
  r.getCommits(null, function(err, commits) {
    var authors = {};
    var main_committer;
    for (var i=0; i<commits.length; i++) {
      if (commits[i].author) {
        var author_obj = commits[i].author;
        var login = author_obj.login;
        authors[login] = authors[login] || author_obj;
        authors[login].count = authors[login].count+1 || 1;
      }
    }

    for (var author in authors) {
      if (main_committer) {
        if (authors[author].count > authors[main_committer.login].count) {
          main_committer = authors[author];
        }
      } else {
        main_committer = authors[author];
      }
    }
    var avatar = '<img src="'+main_committer.avatar_url+'" width="30px" />';
    var title = main_committer.count+' recent commits';
    var html = '<a href="'+main_committer.html_url+'" title="'+title+'">'+avatar+'</a>';
    updateCell(repo.name, 'main_committer', html);
  });
}
