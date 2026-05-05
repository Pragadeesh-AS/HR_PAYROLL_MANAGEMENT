const db = require('./db.js');
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin123', 10);
db.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'admin@gmail.com'])
  .then(() => {
    console.log('Password updated successfully');
    process.exit(0);
  })
  .catch(console.error);
