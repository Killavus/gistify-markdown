function user(token) {
  return {
    headers() {
      return { 'Authorization': `Token ${token}` }; 
    }
  };
}

function noUser() {
  return {
    headers() {
      return {};
    }
  };
}

export default {
  user,
  noUser
};
