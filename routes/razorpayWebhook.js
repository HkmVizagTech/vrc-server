const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Candidate = require('../models/candidate');


router.post(
    '/',
    bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    }),
    async (req, res) => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '4aY4KYYhx8hr0sS4ylzAr560'; 
      const receivedSignature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.rawBody)
        .digest('hex');
  
      if (receivedSignature !== expectedSignature) {
        console.error('Invalid signature', { receivedSignature, expectedSignature });
        return res.status(400).send('Invalid signature');
      }
  
      const event = req.body.event;
      console.log('Webhook event received:', event);
      if (event === 'payment.captured') {
        const payment = req.body.payload.payment.entity;
        const orderId = payment.order_id;
        try {
          const candidate = await Candidate.findOne({ orderId });
          if (candidate && candidate.paymentStatus !== "Paid") {
            candidate.paymentStatus = "Paid";
            candidate.paymentId = payment.id;
            candidate.paymentDate = new Date(payment.created_at * 1000); 
            candidate.paymentMethod = payment.method || "Online";
            await candidate.save();
            console.log('Payment updated for candidate:', candidate._id);
          } else if (!candidate) {
            console.error('No candidate found for orderId', orderId);
          }
        } catch (err) {
          console.error('Webhook DB update failed:', err);
          return res.status(500).send('DB update failed');
        }
      }
      res.status(200).send('OK');
    }
  );

  module.exports = router;