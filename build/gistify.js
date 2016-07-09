'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _randomstring = require('randomstring');

var _randomstring2 = _interopRequireDefault(_randomstring);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var langToExt = function langToExt(language) {
  return { 'react': 'jsx',
    'javascript': 'js',
    'ruby': 'rb',
    'ocaml': 'ml'
  }[language] || 'txt';
};

var isNode = function isNode(node) {
  return node.type !== undefined;
};

var postJSON = function postJSON(options, cb) {
  (0, _request2.default)(options, function (err, response, body) {
    if (err) {
      cb(err);
    } else {
      if (response.statusCode > 299) {
        cb(new Error('Non-success status code: ' + response.statusCode + '\n                     Body: ' + JSON.stringify(body)), null);
      } else {
        cb(null, body);
      }
    }
  });
};

var typeAsync = function typeAsync(item, cb) {
  if (isNode(item)) {
    cb(null, item);
  } else {
    postJSON(item, cb);
  }
};

var idFn = function idFn(x) {
  return x;
};
var matchType = function matchType(type, matchedFn) {
  return function (node) {
    return node.type === type ? matchedFn(node) : idFn(node);
  };
};

function gistify(fileName, user, cb) {
  fs.readFile(fileName, function (err, fileBuf) {
    if (err) cb(err);

    var lexedMarkdown = _marked2.default.lexer(fileBuf.toString('utf8'));
    var parseCodeBlock = function parseCodeBlock(user) {
      return function (node) {
        var extension = langToExt(node.lang);
        var fileName = _randomstring2.default.generate(8) + '.' + extension;

        return {
          url: 'https://api.github.com/gists',
          method: 'POST',
          headers: Object.assign({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
          }, user.headers()),
          json: {
            description: 'Created using code-blocks-to-gists.',
            public: true,
            files: _defineProperty({}, fileName, { content: node.text })
          }
        };
      };
    };

    var lexedMarkdownWithCodeMapped = lexedMarkdown.map(matchType('code', parseCodeBlock(user)));

    _async2.default.map(lexedMarkdownWithCodeMapped, typeAsync, function (err, results) {
      if (err) {
        cb(err);
      }
      var modified = results.map(function (item) {
        if (isNode(item)) return item;else {
          return { type: 'paragraph', text: '[' + item.html_url + '](' + item.html_url + ')' };
        }
      });

      cb(null, modified);
    });
  });
};

exports.default = gistify;