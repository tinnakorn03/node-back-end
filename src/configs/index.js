const database = require('./firebaseConfig');

module.exports = {
  server: {
    PORT: process.env.PORT,
  },
  secret: 'origin-test',
  firebase: database
};