'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function user(token) {
  return {
    headers: function headers() {
      return { 'Authorization': 'Token ' + token };
    }
  };
}

function noUser() {
  return {
    headers: function headers() {
      return {};
    }
  };
}

exports.default = {
  user: user,
  noUser: noUser
};