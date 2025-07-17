const express = require('express');
const router = express.Router();
const Volunteer = require('../models/volunteerform');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({ 
  cloud_name: 'ddmzeqpkc', 
  api_key: '467773421832135', 
  api_secret: 'Iaa3QHrnAlB3O1vSBjShTbd4zuE' 
});


router.post('/api/volunteers', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'volunteers' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const data = req.body;

    // 🔥 Parse serviceAvailability string into an array
    if (typeof data.serviceAvailability === 'string') {
      data.serviceAvailability = JSON.parse(data.serviceAvailability);
    }

    if (imageUrl) data.imageUrl = imageUrl;

    const volunteer = new Volunteer(data);
    await volunteer.save();

    res.status(201).json({ message: 'Volunteer registered successfully', volunteer });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(400).json({ message: 'Error registering volunteer', error: error.message });
  }
});


router.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/api/volunteers/:whatsappNumber', async (req, res) => {
  const { whatsappNumber } = req.params;

  try {
    const volunteer = await Volunteer.findOne({ whatsappNumber });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(200).json(volunteer);
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/api/volunteers', async (req, res) => {
  try {
    const result = await Volunteer.deleteMany({});
    res.status(200).json({ message: 'All volunteer records deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting volunteers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.patch('/api/volunteers/:id', async (req, res) => {
  try {
    const { id } = req.params;
   
    const updateData = req.body;
   
    if (typeof updateData.serviceAvailability === 'string') {
      updateData.serviceAvailability = JSON.parse(updateData.serviceAvailability);
    }
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.status(200).json({ message: 'Volunteer updated', volunteer: updatedVolunteer });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(400).json({ message: 'Error updating volunteer', error: error.message });
  }
});


module.exports = router;
