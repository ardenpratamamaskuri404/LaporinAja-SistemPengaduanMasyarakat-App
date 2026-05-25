const bcrypt = require('bcryptjs');

const hash = '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.';
const password = 'password123';

bcrypt.compare(password, hash).then(isMatch => {
  console.log(`Password "${password}" matches hash: ${isMatch}`);
  process.exit(0);
});
