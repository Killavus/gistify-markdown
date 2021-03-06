import marked from 'marked';
import * as fs from 'fs';
import async from 'async';
import request from 'request';
import randomstring from 'randomstring';

const langToExt = language => ({ 'react': 'jsx',
                                 'javascript': 'js',
                                 'ruby': 'rb',
                                 'ocaml': 'ml'
                               }[language] || 'txt');

const isNode = node => node.type !== undefined;

const postJSON = (options, cb) => {
  request(options, (err, response, body) => {
    if (err) { cb(err); }
    else { 
      if (response.statusCode > 299) {
        cb(new Error(`Non-success status code: ${response.statusCode}
                     Body: ${JSON.stringify(body)}`), null);
      }
      else { 
        cb(null, body);
      } 
    }
  });
};

const typeAsync = (item, cb) => {
  if (isNode(item)) {
    cb(null, item);
  }
  else {
    postJSON(item, cb);
  }
};

const idFn = x => x;
const matchType = (type, matchedFn) => node =>
                    (node.type === type) ? matchedFn(node) : idFn(node);

function gistify(fileName, user, cb) {
  fs.readFile(fileName, (err, fileBuf) => {
    if (err) cb(err);

    const lexedMarkdown = marked.lexer(fileBuf.toString('utf8'));
    const parseCodeBlock = user => node => {
      const extension = langToExt(node.lang);
      const fileName = `${randomstring.generate(8)}.${extension}`;

      return {
        url: 'https://api.github.com/gists',
        method: 'POST',
        headers: Object.assign({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        }, user.headers()),
        json: {
          description: 'Created using gistify-markdown (https://github.com/Killavus/gistify-markdown).',
          public: true,
          files: {
            [fileName]: { content: node.text }
          }
        }
      };
    };

    const lexedMarkdownWithCodeMapped = lexedMarkdown.map(matchType(
                                          'code',
                                          parseCodeBlock(user)));

    async.map(lexedMarkdownWithCodeMapped, typeAsync, (err, results) => {
      if (err) { cb(err); }
      const modified = results.map(item => {
        if (isNode(item)) return item;
        else {
          return { type: 'paragraph', text: `[${item.html_url}](${item.html_url})` }
        }
      });

      cb(null, modified);
    });
  });
};

export default gistify;
