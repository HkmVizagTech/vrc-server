const express = require('express');
const router = express.Router();
const Volunteer = require('../models/volunteerform');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const gupshup = require('@api/gupshup');
const path = require('path');

const { google } = require('googleapis');
const SHEET_ID = '1vqIritMiZSiothAUpra88t8KYuv8SAJq7xEtDyTb7lo'; 
const SHEET_NAME = 'Sheet1'; 


const auth = new google.auth.GoogleAuth({
  keyFile: '/keys/volunteer-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });


const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

cloudinary.config({
  cloud_name: 'ddmzeqpkc',
  api_key: '467773421832135',
  api_secret: 'Iaa3QHrnAlB3O1vSBjShTbd4zuE'
});

router.post('/api/volunteers', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      try {
        imageUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'volunteers' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return reject(error);
              }
              resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      } catch (err) {
        console.error('Error during Cloudinary upload:', err);
        return res.status(500).json({ message: 'Cloudinary upload failed', error: err.message });
      }
    }

    const data = req.body;

    if (typeof data.serviceAvailability === 'string') {
      data.serviceAvailability = JSON.parse(data.serviceAvailability);
    }
    if (typeof data.needAccommodation === 'string') {
      data.needAccommodation = data.needAccommodation.toLowerCase() === 'true';
    }

    if (imageUrl) data.imageUrl = imageUrl;

    const volunteer = new Volunteer(data);
    await volunteer.save();

    // Uncomment and use Gupshup if needed
    // const fullNumber = `91${volunteer.whatsappNumber}`;
    // const message1 = await gupshup.sendingTextTemplate(
    //   {
    //     template: {
    //       id: '0c9f56f3-2e3d-4786-bfcd-3e1ffc441567',
    //       params: [
    //         volunteer.name,
    //         "Volunteer",
    //         // location
    //       ],
    //     },
    //     'src.name': 'Production',
    //     destination: fullNumber,
    //     source: '917075176108',
    //   },
    //   {
    //     apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
    //   }
    // );


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

router.delete('/api/volunteers/:id', async (req, res) => {
  try {
    const result = await Volunteer.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
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


router.post('/api/export-volunteers', async (req, res) => {
  const volunteers = req.body.volunteers;
  if (!Array.isArray(volunteers)) return res.status(400).send({ message: "Invalid data" });

  
  const DATES = ["August 14", "August 15", "August 16", "August 17"];

  try {
    
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Z`, 
    });

    const existingIDs = sheetData.data.values ? sheetData.data.values.map(row => row[0]) : [];
    const newVolunteers = volunteers.filter(v => !existingIDs.includes(v._id));

    if (newVolunteers.length === 0) {
      return res.json({ message: "No new volunteers to export." });
    }

    const rows = newVolunteers.map(v => {
      
      const availability = {};
      (v.serviceAvailability || []).forEach(slot => {
        availability[slot.date] = slot.timeSlot;
      });

      return [
        v._id,
        v.name,
        v.whatsappNumber,
        v.gender,
        v.age,
        v.dateOfBirth,
        v.maritalStatus,
        v.profession,
        v.collegeOrCompany,
        v.locality,
        v.referredBy,
        v.infoSource,
        v.needAccommodation ? "Yes" : "No",
        ...DATES.map(date => availability[date] || ""),
        v.assignedService || "",
        v.imageUrl ? `=IMAGE("${v.imageUrl}")` : "",
        v.createdAt || "",
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows }
    });

    res.json({ message: `Exported ${newVolunteers.length} new volunteers!` });
  } catch (err) {
    console.error('Google Sheets export failed:', err);
    res.status(500).send({ message: "Google Sheets export failed...", error: err.message });
  }
});

module.exports = router;
