const mongoose = require('mongoose');
const MessageSchema = mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required: true,
    },
    ReciverID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customers",
          required: true,
    },
    text: {
        type:String,
    },
    timestamp: { type: Date, default: Date.now }
},
);

module.exports = mongoose.model('message', MessageSchema);