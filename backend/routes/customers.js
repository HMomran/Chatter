const express = require('express');
const router = express.Router();
const Customer = require('../models/Customers');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await Customer.findOne({ _id: id });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});

router.get('/check-phone/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    res.status(200).json({ exists: !!customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/check-customer/:name/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      name: req.params.name, 
      phone: req.params.phone 
    });
    res.status(200).json({ exists: !!customer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.post('/', async (req, res) => {
    try {
        const customer = new Customer(req.body);
        const savedCustomer = await customer.save();
        res.status(200).json(savedCustomer);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: id },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCustomer = await Customer.deleteOne({ _id: id });
        res.status(200).json(deletedCustomer);
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error: error });
    }
});

module.exports = router;