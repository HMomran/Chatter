const mongoose = require('mongoose');
const CustomerSchema = mongoose.Schema({
    name: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);