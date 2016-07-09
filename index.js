var gistify = require('./build/gistify').default;
var unparse = require('./build/unparse').default;
var userModule = require('./build/user').default;
var process = require('process');

var user = userModule.user;
var noUser = userModule.noUser;

var args = process.argv.slice(2);
var fileName = args[0];
var token = args[1];

var currentUser = token ? user(token) : noUser();

gistify(fileName, currentUser, function processGistifiedMarkdown(err, lexems) {
  if (err) throw err;
  console.log(unparse(lexems));
});

