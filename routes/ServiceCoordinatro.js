const express = require('express');
const router = express.Router();
const ServiceCoordinator = require('../models/serviceCoordinatorSchema');


router.post('/api/add', async (req, res) => {
  try {
    const { serviceName, coordinatorName, coordinatorNumber } = req.body;
    const coordinator = new ServiceCoordinator({ serviceName, coordinatorName, coordinatorNumber });
    const saved = await coordinator.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const coordinators = await ServiceCoordinator.find();
    res.json(coordinators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const coordinator = await ServiceCoordinator.findById(req.params.id);
    if (!coordinator) return res.status(404).json({ error: 'Not found' });
    res.json(coordinator);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { serviceName, coordinatorName, coordinatorNumber } = req.body;
    const updated = await ServiceCoordinator.findByIdAndUpdate(
      req.params.id,
      { serviceName, coordinatorName, coordinatorNumber },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await ServiceCoordinator.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;