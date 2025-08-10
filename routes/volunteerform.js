const express = require('express');
const router = express.Router();
const Volunteer = require('../models/volunteerformtesting')
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const gupshup = require('@api/gupshup');
const path = require('path');

const { google } = require('googleapis');
const SHEET_ID = '1vqIritMiZSiothAUpra88t8KYuv8SAJq7xEtDyTb7lo';
const SHEET_NAME = 'MASTER';

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

const DATES = ["August 14", "August 15", "August 16", "August 17"];
const HEADERS = [
  "ID",
  "Name",
  "WhatsApp",
  "Gender",
  "Age",
  "DOB",
  "Marital Status",
  "Profession",
  "College/Company",
  "Locality",
  "Referred By",
  "Info Source",
  "T-Shirt Size",
  "Accommodation",
  ...DATES,
  "Assigned Service",
  "Image",
  "Created At"
];

async function ensureSheetHeaders() {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] }
  });
}

async function exportVolunteerToSheet(volunteer) {
  try {
    await ensureSheetHeaders();

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:A`
    });
    const existingIDs = sheetData.data.values ? sheetData.data.values.map(row => row[0]) : [];
    if (existingIDs.includes(volunteer._id.toString())) {
      return false;
    }

    const availability = {};
    (volunteer.serviceAvailability || []).forEach(slot => {
      availability[slot.date] = slot.timeSlot;
    });

    const row = [
      volunteer._id,
      volunteer.name,
      volunteer.whatsappNumber,
      volunteer.gender,
      volunteer.age,
      volunteer.dateOfBirth,
      volunteer.maritalStatus,
      volunteer.profession,
      volunteer.collegeOrCompany,
      volunteer.locality,
      volunteer.referredBy,
      volunteer.infoSource,
      volunteer.tshirtSize,
      volunteer.needAccommodation ? "Yes" : "No",
      ...DATES.map(date => availability[date] || ""),
      volunteer.assignedService || "",
      volunteer.imageUrl ? `=IMAGE("${volunteer.imageUrl}")` : "",
      volunteer.createdAt || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    return true;
  } catch (err) {
    console.error('Google Sheets export failed:', err);
    throw err;
  }
}

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

    try {
      await exportVolunteerToSheet(volunteer);
    } catch (err) {
      console.error('Google Sheets export failed after registration:', err);
    }

    const fullNumber = `91${volunteer.whatsappNumber}`;
    try {
      await gupshup.sendingTextTemplate(
        {
          template: {
            id: '0c9f56f3-2e3d-4786-bfcd-3e1ffc441567',
            params: [
              volunteer.name,
              "Volunteer",
            ],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
    } catch (err) {
      console.error('Error sending Gupshup message:', err);
    }

    res.status(201).json({ message: 'Volunteer registered successfully', volunteer });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(400).json({ message: 'Error registering volunteer', error: error.message });
  }
});

router.get('/api/volunteers', async (req, res) => {
  try {
    const { name, whatsapp, slot, page = 1, pageSize = 20, all = false } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (whatsapp) query.whatsappNumber = { $regex: whatsapp, $options: 'i' };
    if (slot) query['serviceAvailability.date'] = slot;

    const allFlag = all === true || all === 'true' || all === 1 || all === '1';

    let volunteers, totalCount;
    if (allFlag) {
      volunteers = await Volunteer.find(query)
        .populate('assignedService') 
        .sort({ createdAt: -1 });
      totalCount = volunteers.length;
    } else {
      const skip = (parseInt(page) - 1) * parseInt(pageSize);
      totalCount = await Volunteer.countDocuments(query);
      volunteers = await Volunteer.find(query)
        .skip(skip)
        .limit(parseInt(pageSize))
        .populate('assignedService') 
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      data: volunteers,
      totalCount
    });
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
    if (updateData.assignedService) {
      
      if (typeof updateData.assignedService === 'string') {
        updateData.assignedService = new mongoose.Types.ObjectId(updateData.assignedService);
      }
  
    }
    updateData.updatedAt = new Date();
    //console.log('Updating volunteer with data:', JSON.stringify(updateData, null, 2));

    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

   // console.log('Updated volunteer:', JSON.stringify(updatedVolunteer, null, 2));

    res.status(200).json({ 
      message: 'Volunteer updated successfully', 
      volunteer: updatedVolunteer 
    });
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(400).json({ 
      message: 'Error updating volunteer', 
      error: error.message 
    });
  }
});


router.post('/api/export-volunteers', async (req, res) => {
  const volunteers = req.body.volunteers;
  if (!Array.isArray(volunteers)) return res.status(400).send({ message: "Invalid data" });

  try {
    await ensureSheetHeaders();
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:Z`,
    });


    const rows = volunteers.map(v => {
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
        v.tshirtSize,
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
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows }
    });

    res.json({ message: `Exported ${volunteers.length} volunteers!` });
  } catch (err) {
    console.error('Google Sheets export failed:', err);
    res.status(500).send({ message: "Google Sheets export failed...", error: err.message });
  }
});

router.post('/api/attendance', async (req, res) => {
  try {
    const { whatsappNumber, date, serviceType } = req.body;
    if (!whatsappNumber || !date || !serviceType) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const volunteer = await Volunteer.findOne({ whatsappNumber });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }

    volunteer.attendance = volunteer.attendance || [];

    const alreadyAttended = volunteer.attendance.find(
      a => a.date === date && a.serviceType === serviceType && a.attended
    );
    if (alreadyAttended) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }

    volunteer.attendance.push({
      date,
      serviceType,
      attended: true
    });

    await volunteer.save();

    res.json({ message: 'Attendance marked successfully.', volunteer });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

module.exports = router;