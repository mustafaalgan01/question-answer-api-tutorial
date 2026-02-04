const bcrypt = require("bcryptjs");

const validedUserInput = (email, password) => {
    return email && password;
};

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};
module.exports = { validedUserInput, comparePassword };