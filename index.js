const gistify = require('./build/gistify').default;
const unparse = require('./build/unparse').default;

gistify('./src/test.md', function processGistifiedMarkdown(err, lexems) {
  if (err) throw err;
  console.log(unparse(lexems));
});
