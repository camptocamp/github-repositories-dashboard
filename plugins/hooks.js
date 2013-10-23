dashboard.hooks = function(repo) {
  repo.listHooks(function(err, hooks) {
    console.log(hooks);
  });
}
