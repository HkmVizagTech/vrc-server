const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// const razorpay = require('razorpay'); // <-- Replace with your actual Razorpay instance
const Candidate = require('../models/candidate');
const Razorpay = require('razorpay');
const gupshup=require('@api/gupshup');


const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID,
 key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Your Mongoose model
// const gupshup = require('./gupshup'); // Assuming you have a wrapper for Gupshup
// Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { amount, formData } = req.body;

  const receipt = `receipt_${Date.now()}`;

  const options = {
    amount, // in paise
    currency: "INR",
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);

    const normalizedNumber = "91" + formData.whatsappNumber;

    // Save candidate as pending
    const candidate = new Candidate({
      serialNo: formData.serialNo,
      name: formData.name.trim(),
      gender: formData.gender,
      college: formData.college,
      course: formData.course,
      year: formData.year,
      dob: new Date(formData.dob),
      registrationDate: new Date(),
      collegeOrWorking: formData.collegeOrWorking,
      companyName: formData.companyName,
      whatsappNumber: normalizedNumber,
      slot: formData.slot,
      paymentStatus: "Pending",
      orderId: order.id,
      paymentAmount: parseFloat(amount) / 100, // convert paise to rupees
      receipt: receipt,
      email: formData.email,
    });

    await candidate.save();

    return res.json(order);
  } catch (err) {
    console.error("Error creating order and saving candidate:", err);
    return res.status(500).json({ status: "error", message: "Failed to create order" });
  }
});



// Verify payment and save candidate
router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ status: "fail", message: "Payment verification failed" });
  }

  try {
    // Find the candidate based on the order ID
    const candidate = await Candidate.findOne({ orderId: razorpay_order_id });

    if (!candidate) {
      return res.status(404).json({ status: "fail", message: "Candidate not found" });
    }

    // If already paid, skip updating
    if (candidate.paymentStatus === "Paid") {
      return res.json({ message: "Already Registered", candidate });
    }

    candidate.paymentId = razorpay_payment_id;
    candidate.paymentDate = new Date();
    candidate.paymentStatus = "Paid";
    candidate.paymentMethod = "Online";

    await candidate.save();

    // Send WhatsApp message
    const normalizedNumber = candidate.whatsappNumber;

    const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '8d7d1fff-0543-4a4f-bc33-886bb0aa1fef',
          params: [candidate.name],
        },
        'src.name': 'Production',
        destination: normalizedNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );

    console.log("WhatsApp message sent:", message.data);

    return res.json({ message: "success", candidate });

  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({ status: "error", message: "Registration failed" });
  }
});
router.put("/update-payment/:id", async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  try {
    const updated = await Candidate.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// router.delete("/delete-candidate/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Candidate.findByIdAndDelete(id);
//     res.json({ message: "Candidate deleted successfully." });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting candidate." });
//   }
// });


router.get('/data', async (req, res) => {
 try {
   const data = await Candidate.find();
   res.status(200).json(data);
 } catch (err) {
   console.error("Error fetching candidate data:", err);
   res.status(500).json({ status: "error", message: "Failed to fetch data" });
 }
});
// Mark attendance by WhatsApp number
router.post("/attendance/:phone", async (req, res) => {
 try {
   const phone = "91" + req.params.phone;


   const candidate = await Candidate.findOne({ whatsappNumber: phone });


   if (!candidate) {
     return res.status(404).json({ status: "error", message: "Candidate not found" });
   }


   if (candidate.attendance) {
     return res.status(200).json({ status: "info", message: "Already marked as attended" });
   }


   candidate.attendance = true;
   await candidate.save();


   res.status(200).json({ status: "success", message: "Attendance marked successfully" });
 } catch (err) {
   console.error("Error marking attendance:", err);
   res.status(500).json({ status: "error", message: "Failed to mark attendance" });
 }
});
// POST /mark-attendance
router.post("/mark-attendance", async (req, res) => {
  const { whatsappNumber } = req.body;
  const fullNumber = "91" + whatsappNumber;

  try {
    const candidate = await Candidate.findOne({ whatsappNumber: fullNumber });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.attendance === true) {
      return res.json({ status: "already-marked", message: "Attendance already taken" });
    }

    candidate.attendance = true;
    await candidate.save();

    const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '88021e4e-88ae-4cba-bdba-f9b1be3b4948',
          params: [candidate.name],
        },
        'src.name': 'Production',
        destination: fullNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );

    console.log(message.data);

    res.json({ status: "success", name: candidate.name });

  } catch (err) {
    console.error("Attendance marking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all candidates who have marked attendance
router.get("/attendance-list", async (req, res) => {
 try {
   const attendedCandidates = await Candidate.find({ attendance: true });
   res.status(200).json(attendedCandidates);
 } catch (err) {
   console.error("Error fetching attendance list:", err);
   res.status(500).json({ message: "Server error" });
 }
});
router.delete('/asm',async(req,res)=>{
 const del= await Candidate.deleteMany({name:'sivva'});
 console.log(del.deletedCount);
 return res.json({data:del.deletedCount});
})
// GET /verify-payment/:id — Validate payment ID
router.get("/verify-payment/:id", async (req, res) => {
 const { id: paymentId } = req.params;


 try {
   // Fetch payment from Razorpay
   // const payment = await razorpay.payments.fetch(paymentId);


   // // Check status
   // if (payment && payment.status === "captured") {
     // Optional: Cross-check that this paymentId exists in your database too
     const candidate = await Candidate.findOne({ paymentId });
     if (!candidate) {
       return res.status(404).json({ success: false, message: "No matching candidate found for this payment ID." });
     }


     return res.status(200).json({
       success: true,
       message: "Payment verified",
       candidate,
     });
   // else {
   //   return res.status(400).json({ success: false, message: "Payment not captured or invalid." });
   // }
 } catch (err) {
   console.error("Payment fetch failed:", err.message);
   return res.status(500).json({ success: false, message: "Error verifying payment ID" });
 }
});
const PDFDocument = require('pdfkit');
router.get('/download-receipt/:id', async (req, res) => {
 const { id: paymentId } = req.params;


 try {
   const candidate = await Candidate.findOne({ paymentId });


   if (!candidate) {
     return res.status(404).json({ success: false, message: "Candidate not found" });
   }


   // Set headers for file download
   res.setHeader('Content-Disposition', `attachment; filename=receipt_${candidate.serialNo}.pdf`);
   res.setHeader('Content-Type', 'application/pdf');


   const PDFDocument = require('pdfkit');
   const doc = new PDFDocument();


   doc.pipe(res);


   // Title
   doc.fillColor('blue').fontSize(20).text('Krishna Pulse Youth Fest 2024', { align: 'center' });
   doc.moveDown();


   // Section Title - Blue
   doc.fillColor('blue').fontSize(14).text('Payment Receipt', { underline: true });
   doc.moveDown();


   // Receipt & Personal Details
   doc.fontSize(12).fillColor('blue');
   doc.text(`Receipt No: ${candidate.receipt}`);
   doc.text(`Name: ${candidate.name}`);
   doc.text(`Slot: ${candidate.slot}`);
   doc.text(`Gender: ${candidate.gender}`);
   doc.text(`College: ${candidate.college || 'N/A'}`);
   doc.text(`Course: ${candidate.course || 'N/A'}`);
   doc.text(`Year: ${candidate.year || 'N/A'}`);
   doc.text(`Date of Birth: ${candidate.dob.toDateString()}`);
   doc.text(`Registration Date: ${candidate.registrationDate.toDateString()}`);
   doc.moveDown();


   // Contact & Payment Info
   doc.text(`WhatsApp: ${candidate.whatsappNumber}`);
   doc.text(`Amount Paid: ₹${candidate.paymentAmount}`);
   doc.text(`Payment ID: ${candidate.paymentId}`);
   doc.text(`Order ID: ${candidate.orderId}`);
   doc.text(`Payment Date: ${candidate.paymentDate.toDateString()}`);
   doc.text(`Method: ${candidate.paymentMethod}`);
   doc.moveDown();


   // ✅ Status - Green
   doc.fillColor('green').text(`Status: ${candidate.paymentStatus}`);


   doc.end();
 } catch (err) {
   console.error("Receipt generation error:", err.message);
   res.status(500).json({ success: false, message: "Error generating receipt" });
 }
});




module.exports = router;



