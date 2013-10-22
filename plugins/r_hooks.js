dashboard.r_hooks = function(name) {
  var r = repositories[name]['repo'];
  r.listHooks(function(err, hooks) {
    console.log(hooks);
  });
}
