const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: [true, "Username already taken"],
    },
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },
      email: {
        type: String,
        required: [true, "Please provide an Email!"],
      },
      phone: {
        type: String,
        required: true
      },
    
});

const MyUsers = mongoose.model('Users', UserSchema);

module.exports = MyUsers;