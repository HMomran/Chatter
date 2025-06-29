const express = require('express');
const router = express.Router();
const Message = require('../models/message');

router.get('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const messages = await Message.find({
            $or: [{ senderID: id }, { ReciverID: id }]
        }).populate('senderID', 'name phone').populate('ReciverID', 'name phone');
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});

module.exports = router;