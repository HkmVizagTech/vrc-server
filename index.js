const express=require('express');
const app=express();
const db=require('./config/db');
require('dotenv').config();
const Volunteer=require('./models/volunter')
const cors=require('cors')
const gupshup=require('@api/gupshup')
const Manager=require('./models/manager');
const Service=require('./models/services')
const Event=require('./models/meetup')
const moment = require('moment');
const moment1 = require("moment-timezone");
const cron = require('node-cron');
const axios = require('axios');
const xlsx = require('xlsx');
const qs = require('qs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const VolunteerAttendance = require('./models/attendence')
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const ManualAttendance=require('./models/manual')
const ExcelJS = require('exceljs');
const Register = require('./routes/register');
const Response =require('./models/flcUserdata')
const  userRouter = require('./routes/userRoutes');
// const ExcelJS = require('exceljs');
// const fs = require('fs');
// const path = require('path');
const archiver = require('archiver');
// const fs = require('fs');
// const path = require('path');
const cloudinary = require('cloudinary').v2;
// const file=require('./')
// const manager = require('./models/manager');
db();
app.use(cors());
app.use(express.json());
cloudinary.config({
  cloud_name: 'dvm9yapki',
  api_key: '435241843987915',
  api_secret: 'RC506MY4qn6DV5shRvYOmvBXIOc'
});
app.use('/register',Register);
app.use('/college',require('./routes/college'))
app.use('/july',require('./routes/julyattendence'))
app.use("/volunteerform", require("./routes/volunteerform"));
app.use("/servicecoordinator", require("./routes/ServiceCoordinatro"));
app.use("/user", userRouter)
// const sendReminder = async (event, type) => {
//   console.log(`🔔 Sending ${type} reminder for: ${event.venue} at ${event.cronDate}`);
//   const users= await Volunteer.find({});
//   for (const user of users){
//      const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

// const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
//   ? numberOnly
//   : `91${numberOnly.slice(-10)}`; // take the last 10 digits

//   await gupshup.sendingTextTemplate(
//     {
//       template: {
//         id: "2643a762-e3b0-45fc-9005-fc687ee18480",
//         params: [
//           user.name,
//           event.dateDisplay,
//           event.timeDisplay,
//           event.venue,
//           event.locationLink,
//         ],
//       },
//       "src.name": "Production",
//       destination: fullNumber,
//       source: "917075176108",
//     },
//     {
//       apikey: "zbut4tsg1ouor2jks4umy1d92salxm38",
//     }
//   );
// }
// }

// cron.schedule("*/15 * * * *", async () => {
//   console.log("🔄 Running cron job to check for upcoming events...");
//   try {
//     const now = moment();
//     const oneDayAhead = now.clone().add(1, "day");
//     const oneHourAhead = now.clone().add(1, "hour");

//     const events = await Event.find({
//       cronDate: { $gte: now.toDate(), $lte: moment().add(2, "days").toDate() },
//     });

//     for (const event of events) {
//       const eventTime = moment(event.cronDate);
//       const diffToDay = Math.abs(eventTime.diff(oneDayAhead, "minutes"));
//       const diffToHour = Math.abs(eventTime.diff(oneHourAhead, "minutes"));

//       if (diffToDay <= 15 && !event.sentOneDayReminder) {
//         await sendReminder(event, "⏰ 1-day");
//         event.sentOneDayReminder = true;
//         await event.save();
//       } else if (diffToHour <= 15 && !event.sentOneHourReminder) {
//         await sendReminder(event, "⏰ 1-hour");
//         event.sentOneHourReminder = true;
//         await event.save();
//       }
//     }
//   } catch (err) {
//     console.error("❌ Cron job error:", err.message);
//   }
// });
// const FIXED_EVENT_TIME = moment.tz("2025-06-27 08:00", "Asia/Kolkata");

// const sendReminder1 = async (type) => {
//   console.log(`🔔 Sending ${type} reminder for event at ${FIXED_EVENT_TIME.format("DD/MM/YYYY hh:mm A")}`);
  
//          const volunteers=await Volunteer.find({});
//            for (const user of volunteers) {

//     const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

// const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
//   ? numberOnly
//   : `91${numberOnly.slice(-10)}`; // take the last 10 digits

//           // const reporting = await Manager.findOne({ name: user.serviceType });
//           const manager = await Manager.findOne({ serviceType: user.serviceType });
//      const message= await gupshup.sendingTextTemplate(
//         {
//           template: {
//             id: '04ad934d-66d0-4558-8c12-d740345e4c40',
//             params: [
//               user.name,
//              "This is a gentle reminder: your seva begins in about 24 hour.",
//                "jaganath",
//              user.serviceType,
           
//               " Jagannath Swami Ki "
//             //   location // fallback if message is empty
//             ],
//           },
//           'src.name': 'Production',
//           destination: fullNumber,
//           source: '917075176108',
//         },
//         {
//           apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
//         }
//       );
//       console.log(fullNumber,message)
//       await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
//     }
//     // return res.json({message:"message sent successfully"})
// };

// let oneDayReminderSent = false;
// let oneHourReminderSent = true;

// cron.schedule("*/5 * * * *", async () => {
//   const now = moment.tz("Asia/Kolkata");
//   const diffMinutes = FIXED_EVENT_TIME.diff(now, "minutes");

//   console.log(`🕒 Now: ${now.format("DD/MM/YYYY hh:mm A")}, Event in ${diffMinutes} mins`);

//   try {
//     if (diffMinutes <= 1440 && diffMinutes > 1430 && !oneDayReminderSent) {
//       await sendReminder1("⏰ 1-day");
//       oneDayReminderSent = true;
//     }

//     if (diffMinutes <= 60 && diffMinutes > 50 && !oneHourReminderSent) {
//       await sendReminder1("⏰ 1-hour");
//       oneHourReminderSent = true;
//     }
//   } catch (err) {
//     console.error("❌ Cron error:", err.message);
//   }
// });
app.use('/api',require('./routes/august15'))
app.post('/user', async (req, res) => {
  try {
    const { age, ...rest } = req.body;

    // Convert age to a number, or set to undefined if invalid
    const numericAge = !isNaN(Number(age)) ? Number(age) : undefined;

    const newVolunteer = new Volunteer({
      ...rest,
      age: numericAge,
    });

    await newVolunteer.save();

    const fullNumber = newVolunteer.whatsappNumber.startsWith('91')
      ? newVolunteer.whatsappNumber
      : `91${newVolunteer.whatsappNumber}`;

    const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '868b6c27-b39a-4689-9def-261a5527d3dc',
          params: [newVolunteer.name],
        },
        'src.name': 'Production',
        destination: fullNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
    const message1= await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
            params: [
              newVolunteer.name,
             "WhatsApp group",
               "https://chat.whatsapp.com/IMEzoJR7JUoIYItO4NZRju ",
            //   location // fallback if message is empty
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
    console.log(message.data);
    console.log(message1.data);
    console.log(newVolunteer)
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error saving volunteer:", error);
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
});
app.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVolunteer = await Volunteer.findByIdAndDelete(id);

    if (!deletedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(200).json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/',async(req,res)=>{
    const users=await    Volunteer.find({});
    return res.json(users)
})
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log("siva",PORT);
})
// PATCH /:id
app.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { serviceType } = req.body

    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { serviceType },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message })
  }
})
app.post('/meetup', async (req, res) => {
  const { name, location, date, time, message } = req.body;

  try {
    const volunteers = await Volunteer.find();

    // Convert form date & time to IST
    const eventDateTime = new Date(`${date}T${time}`);

    const formattedDate = eventDateTime.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    const formattedTime = eventDateTime.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    for (const user of volunteers) {
      const fullNumber = user.whatsappNumber.startsWith('91')
        ? user.whatsappNumber
        : `91${user.whatsappNumber}`;

      await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'c644a009-5be0-438a-bfff-54d4576f394d',
            params: [
              user.name,
              name,
              `Training at ${location}`,
              formattedDate,
              formattedTime,
              message || '-',
              user.serviceAvailability,
              location // fallback if message is empty
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

      await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    }

    res.status(200).json({ success: true, message: 'Meetup messages sent to all volunteers' });
  } catch (error) {
    console.error('Error sending messages:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/send-notification', async (req, res) => {
  try {
    // const volunteers = await Volunteer.find({ serviceType:"" }); 
    // // Only volunteers with serviceType
  const volunteers = await ManualAttendance.find()
  .populate({
    path: 'volunteer',
    match: { serviceType: "RATHA PRASADAM DISTRIBUTION" }
  });

const filtered = volunteers.filter(v => v.volunteer);

let count = 0;

for (const user of filtered) {
  try {
    const numberOnly = user.volunteer.whatsappNumber?.replace(/\D/g, "");
    const fullNumber = numberOnly?.length === 12 && numberOnly.startsWith("91")
      ? numberOnly
      : `91${numberOnly?.slice(-10)}`;

    const manager = await Manager.findOne({ serviceType: user.volunteer.serviceType });

    if (!manager) {
      console.warn(`⚠️ No manager found for serviceType: ${user.volunteer.serviceType}`);
      continue;
    }

    // const message = await gupshup.sendingTextTemplate(
    //   {
    //     template: {
    //       id: 'f6c9b738-735f-4554-8cc4-0d5f0f45daa7',
    //       params: [
    //         user.volunteer.name,
    //         "Thank you for stepping forward...",
    //         user.volunteer.serviceType,
    //         manager.username || "Manager",
    //         manager.phone || "N/A",
    //         "Please report before 2 PM or as per your slot timing at our Volunteer Reception, located just after the Sri Vaibhava Venkateswara Swamy Temple",
    //         "📅 Date: 05th July 2025 ( Saturday )",
    //         "Jagannath Swami Ki "
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
        const message1= await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
            params: [
              user.volunteer.name,
             "*New WhatsApp group for upcominng Ratha yatra*",
               "https://chat.whatsapp.com/GNrjN2f5KYn19N7mG8sPl3?mode=ac_t",
            //   location // fallback if message is empty
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

    console.log(`✅ Sent to ${fullNumber}:`, message1.data);
    count++;
    // if (count === 10) break;

    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (err) {
    console.error(`❌ Error sending to ${user.volunteer.whatsappNumber}:`, err.message);
  }
}

    console.log(`✅ Total messages sent: ${count}`);
    return res.json({ message: "Messages sent successfully", total: count });

  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
});

app.post("/register-volunteer", async (req, res) => {
    try{
  // const { username, phone, serviceType } = req.body
  const { username, phone, serviceType, link, location, reportingTime } = req.body;


  // Validate input
  if (!username || !phone || !serviceType || !link || !location || !reportingTime) {
    return res.status(400).json({ message: "All fields are required." })
  }
    const manager = new Manager({
  username,
  phone,
  serviceType,
  link,
  location,
  reportingTime
});

await manager.save();
// const service = await new Service({
//   name: serviceType,
//   reportingTime: reportingTime});
//   await service.save();

    //        const volunteers=await Volunteer.find({serviceType});
    //        for (const user of volunteers) {

    //   const fullNumber = user.whatsappNumber.startsWith('91')
    //     ? user.whatsappNumber
    //     : `91${user.whatsappNumber}`;

    //   await gupshup.sendingTextTemplate(
    //     {
    //       template: {
    //         id: 'c4147032-8da7-4bb5-a4be-88f145a109e0',
    //         params: [
    //           user.name,
             
    //          user.serviceType,
    //           username,
    //          phone,
         
    //           "Thank You",
    //         //   location // fallback if message is empty
    //         ],
    //       },
    //       'src.name': 'Production',
    //       destination: fullNumber,
    //       source: '917075176108',
    //     },
    //     {
    //       apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
    //     }
    //   );

    //   await new Promise(resolve => setTimeout(resolve, 1000)); // rate limit guard
    // }
    
  // Here, you could save to a database. For now, we log it.
  console.log("New Volunteer:", { username, phone, serviceType })

  res.status(201).json({ message: "Volunteer registered successfully." })
}
catch(err){
    console.log("Error",err);
    return res.status(500).json({message:"Error is Registering the Manager",error:err.message})
}
})
// app.delete("/delete-manager/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedManager = await Manager.findByIdAndDelete(id);

//     if (!deletedManager) {
//       return res.status(404).json({ message: "Manager not found." });
//     }

//     res.status(200).json({ message: "Manager deleted successfully.", data: deletedManager });
//   } catch (err) {
//     console.error("Delete Error:", err);
//     res.status(500).json({ message: "Error deleting manager.", error: err.message });
//   }
// });

app.get('/manager',async(req,res)=>{
    try{
        const manager=await Manager.find({});
        if(!manager){
            return res.status(400).json({message:"No Manager Found"});
        }
        return res.status(200).json(manager);
    }
    catch(err){
            console.log(err);
            return res.status(500).json({message:"Error in loading message",error:err.message})
    }
})
// app.delete('/delete',async (req,res)=>{
//     const users=await Volunteer.deleteMany();
//     const manager=await Manager.deleteMany();
//     return res.status(200).json({data:users,data2:manager})
// })
app.post("/service", async (req, res) => {
  try {
    const service = new Service({ name: req.body.name,reportingTime: req.body.reportingTime });
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all services (GET)
app.get("/service", async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a service by ID (PUT)
app.put("/service/:id", async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a service by ID (DELETE)
app.delete("/service/:id", async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/events', async (req, res) => {
  try {
    const {
      date,          // expected: "2025-06-24"
      time,          // expected: "03:00 PM"
      venue = "Vizag",
      locationLink
    } = req.body;

    if (!date || !time || !locationLink) {
      return res.status(400).json({ error: "date, time, and locationLink are required." });
    }

    const cronDate = moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm A').toDate();

    const newEvent = new Event({
      dateDisplay: date,
      timeDisplay: time,
      cronDate,
      venue,
      locationLink
    });

    await newEvent.save();
    const Users= await Volunteer.find({});
    // let count =0;
    for(const user of Users){
      // const fullNumber = "91"+ user.whatsappNumber;
       const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits

const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
  ? numberOnly
  : `91${numberOnly.slice(-10)}`; // take the last 10 digits
  console.log("Full Number",fullNumber)

    const messages=await gupshup.sendingTextTemplate(
        {
          template: {
            id: '7939638e-af33-4df9-8a99-ad29790a08f0',
            params:[user.name
            ,"Jaganath Ratha Yatra!"
            ,date
            ,time
            ,venue
            ,locationLink
            ,"Jagannath"
           
            ,"Jagannath Swami Ki"],
          },
          'src.name': 'Production',
          destination: fullNumber,
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
      // count++;
      // if(count===10){
      //   break;
      // }
      console.log("Message sent successfully",messages.data)
    }
    res.status(201).json({ message: "Event created successfully", event: newEvent });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating event." });
  }
});
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ cronDate: 1 }); // Sorted by date
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching events." });
  }
});

// Delete event by ID
app.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully.", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting event." });
  }
});

app.post('/group', async (req, res) => {
  try {
    // const start = new Date("2025-06-24T18:00:00+05:30");
    // const end = new Date("2025-06-25T09:50:00+05:30");

    const volunteers = await Volunteer.find({});
    let count=0;

    for (const user of volunteers) {
      const numberOnly = user.whatsappNumber.replace(/\D/g, "");
      const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
        ? numberOnly
        : `91${numberOnly.slice(-10)}`;

      const manager = await Manager.findOne({ serviceType: user.serviceType });

      const message = await gupshup.sendingTextTemplate(
        {
          template: {
            id: '9a9bfee5-acde-488f-8b5d-9e4c57ee14d8',
            params: [
              user.name,
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
      count++;
      console.log(fullNumber, message);
      // await new Promise(resolve => setTimeout(resolve, 1000)); // rate limiting
    }
console.log(`Total messages sent: ${count}`);
    res.json({ message: "message sent successfully" });
  } catch (err) {
    console.error("Error sending group message:", err);
    res.status(500).json({ message: "Failed to send group message", error: err.message });
  }
});

// app.get('/sivaname',async (req,res)=>{
//   try{
// const message= await gupshup.sendingTextTemplate(
//         {
//           template: {
//             id: 'a497c231-500a-433d-9c97-7b08a767d2b9',
//             params: [
//               "siva",
//              "WhatsApp group",
//                "https://chat.whatsapp.com/IMEzoJR7JUoIYItO4NZRju ",
//             //   location // fallback if message is empty
//             ],
//           },
//           'src.name': 'Production',
//           destination: '917682059088',
//           source: '917075176108',
//         },
//         {
//           apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
//         }
//       );
//       return res.status(201).json({ message: `Registration successful ${message.data} `});
//   }
//   catch(err){
//     console.error("Error in sivaname:", err);
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }

// })
app.post('/send-template', async (req, res) => {
  try {
    const users = await Volunteer.find({ serviceType: "" });
    const results = [];

    for (const user of users) {
      const numberOnly = user.whatsappNumber.replace(/\D/g, ""); // remove non-digits
      const fullNumber = numberOnly.length === 12 && numberOnly.startsWith("91")
        ? numberOnly
        : `91${numberOnly.slice(-10)}`;

      const data = qs.stringify({
        channel: 'whatsapp',
        source: '917075176108',
        destination: fullNumber,
        'src.name': '4KoeJVChI420QyWVhAW1kE7L',
        template: JSON.stringify({
          id: 'eac20b13-b389-46ad-917e-74df82058ce9',//eac20b13-b389-46ad-917e-74df82058ce9
          params: []
        }),
        message: JSON.stringify({
          image: {
            link: 'https://fss.gupshup.io/0/public/0/0/gupshup/917075176108/3f74176d-f1b5-498a-8f66-f9e702ef8775/1750766779757_hello.jpg'
          },
          type: 'image'
        })
      });

      try {
        const response = await axios.post('https://api.gupshup.io/wa/api/v1/template/msg', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': 'zbut4tsg1ouor2jks4umy1d92salxm38',
            'Cache-Control': 'no-cache'
          }
        });
        console.log(`Message sent to ${fullNumber}:`, response.data);
        results.push({ number: fullNumber, status: 'success', response: response.data });
      } catch (err) {
        console.error(`Error sending to ${fullNumber}:`, err.response?.data || err.message);
        results.push({ number: fullNumber, status: 'error', error: err.response?.data || err.message });
      }
    }

    // Send final response after processing all users
    res.json({ success: true, results });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/bulk-update-service', async (req, res) => {
  const filePath = path.join(__dirname, 'mainVolunteer.csv');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'CSV file not found.' });
  }

  const updates = [];
  const results = {
    updated: [],
    notFound: [],
    failed: [],
  };

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Normalize all keys to lowercase for safer access
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.trim().toLowerCase()] = row[key].trim();
      }

      const rawNumber = normalizedRow['whatsapp number'] || normalizedRow['phone number'];
      const serviceType = normalizedRow['service'];

      if (!rawNumber || !serviceType) return;

      const numberOnly = rawNumber.replace(/\D/g, '');
      const tenDigitNumber = numberOnly.slice(-10); // Assume last 10 digits are correct

      updates.push({ whatsappNumber: tenDigitNumber, serviceType });
    })
    .on('end', async () => {
      for (const { whatsappNumber, serviceType } of updates) {
        try {
          const updated = await Volunteer.findOneAndUpdate(
            { whatsappNumber },
            { serviceType },
            { new: true }
          );

          if (updated) {
            results.updated.push(whatsappNumber);
          } else {
            results.notFound.push(whatsappNumber);
          }
        } catch (error) {
          results.failed.push({ whatsappNumber, error: error.message });
        }
      }

      res.json({
        message: 'Bulk serviceType update complete.',
        totalProcessed: updates.length,
        ...results,
      });
    })
    .on('error', (err) => {
      console.error('CSV Read Error:', err);
      res.status(500).json({ error: 'Failed to process CSV.' });
    });
});
app.post("/attendence", async (req, res) => {
  const { volunteerId } = req.query;

  if (!volunteerId) {
    return res.status(400).json({ message: "volunteerId is required in query string" });
  }

  try {
    // Check if volunteer exists
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Create attendance with current time
    const attendance = await Attendance.create({
      volunteer: volunteerId,
      // date will default to Date.now()
      status: "Present",
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });

  } catch (error) {
    console.error("Attendance error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post('/generate-qr/:volunteerId', async (req, res) => {
  const { volunteerId } = req.params;

  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    const userId = uuidv4(); // Unique for QR scanning

    // QR content and local file path
    const qrContent = `https://vrc-server-110406681774.asia-south1.run.app/verify/${userId}`;
    const qrFolder = path.join(__dirname, '../qrcodes');
    const qrPath = path.join(qrFolder, `${userId}.png`);

    fs.mkdirSync(qrFolder, { recursive: true });

    await QRCode.toFile(qrPath, qrContent);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(qrPath, {
      folder: 'volunteer_qr',
      public_id: userId,
      resource_type: 'image',
    });

    fs.unlinkSync(qrPath); // Clean up local file

    // Save attendance entry
    const attendance = new VolunteerAttendance({
      volunteer: volunteer._id,
      userId,
      qrUrl: uploadResult.secure_url,
      verified: false,
    });

    await attendance.save();
    const data = qs.stringify({
  channel: 'whatsapp',
  source: '917075176108',
  destination: '919392952946',
  'src.name': '4KoeJVChI420QyWVhAW1kE7L',
  template: JSON.stringify({
    id: 'a5376cf3-bb0d-48ee-99fb-d0eba59e27b6',
    params: [volunteer.name]
  }),
  message: JSON.stringify({
    image: {
      link: uploadResult.secure_url // Use the uploaded QR code URL
    },
    type: 'image'
  })
});

const config = {
  method: 'post',
  url: 'https://api.gupshup.io/wa/api/v1/template/msg',
  headers: {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'apikey': 'zbut4tsg1ouor2jks4umy1d92salxm38'
  },
  data: data
};

axios(config)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });

    res.status(200).json({
      message: 'QR code generated successfully',
      qrUrl: uploadResult.secure_url,
      userId,
    });

  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/verify/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the attendance record by userId
    const attendance = await VolunteerAttendance.findOne({ userId: id });

    if (!attendance) {
      return res.status(404).json({ message: 'Invalid or expired QR code.' });
    }

    // Check if already verified
    if (attendance.verified) {
      return res.status(200).json({ message: 'Volunteer already verified.', verified: true });
    }

    // Mark as verified
    attendance.verified = true;
    attendance.status = 'Present'; // Optional: Set status to Present
    // attendance.verifiedAt = new Date(); // Optional: Track when verification occurred
    await attendance.save();

    res.status(200).json({
      message: 'Volunteer successfully verified.',
      volunteerId: attendance.volunteer,
      verified: true,
    });

  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await ManualAttendance.find().populate('volunteer');
    // const records = await Volunteer.find({ serviceType: "" })
      // .populate({
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/user/:whatsappNumber',async (req,res)=>{
  const { whatsappNumber } = req.params;

  try {
    const user = await Volunteer.findOne({ whatsappNumber });
    const manager = await Manager.findOne({ serviceType: user.serviceType });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({user,manager});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})
app.get('/attendence/:whatsappNumber', async (req, res) => {
  const { whatsappNumber } = req.params;

  try {
    // Exclude serviceType field using projection
    const user = await Volunteer.findOne({ whatsappNumber }, { serviceType: 0, serviceAvailability: 0  });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/manual-attendance', async (req, res) => {
  const { volunteerId, status } = req.body;

  if (!["Present", "Absent"].includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status." });
  }

  try {
    // Check if attendance already exists for this volunteer
    const existing = await ManualAttendance.findOne({ volunteer: volunteerId });

    if (existing) {
      return res.status(409).json({ message: "Attendance already submitted." });
    }

    // Save attendance
    const attendance = new ManualAttendance({
      volunteer: volunteerId,
      status
    });

    await attendance.save();
    res.status(200).json({ message: "Attendance saved." });

  } catch (err) {
    console.error("Manual attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete('/manual-attendance', async (req, res) => {
  const deletem = await ManualAttendance.deleteMany({});
  if (!deletem) {
    return res.status(404).json({ message: "No attendance records found to delete." });
  }
  res.status(200).json({ message: "All attendance records deleted successfully.",deletedCount: deletem.deletedCount});
})
app.get('/si',async (req,res)=>{
  const name= "siva";
  const service="Decoration"
  const number="919392952946"
 const message= await gupshup.sendingTextTemplate(
        {
          template: {
            id: 'f6c9b738-735f-4554-8cc4-0d5f0f45daa7',
            params: [
              name,
             "Thank you for stepping forward to serve in the upcoming Jaganath Ratha Yatra! Your service is not just an offering of time — it is a sacred offering to Lord Jagannath that purifies the heart and brings immense spiritual benefit. ",
             service,
             "manager.username",
         
              number,
              "Please report before 2 PM or as per your slot timing at our Volunteer Reception, located just after the ",
              "*IIAM College Main Gate*.",
              "Jagannath Swami Ki "
            //   location // fallback if message is empty
            ],
          },
          'src.name': 'Production',
          destination: '917682059088',
          source: '917075176108',
        },
        {
          apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
        }
      );
    console.log(message.data);
    return res.status(200).json({message:"message sent successfully"})
})
app.get('/new',async (req,res)=>{
 try {
  // const today6pm = new Date();
  // today6pm.setHours(18, 0, 0, 0); // today at 6:00 PM

const volunteers = await Volunteer.find({
  serviceType: "VIP Hospitality"
});

// Assuming you want to get the serviceType from the first volunteer


  console.log("Volunteers:", volunteers.length);
  return res.json({volunteers});
} catch (error) {
  console.error("Error fetching volunteers:", error);
  return res.status(500).json({ error: "Internal server error" });
}
})
app.post('/bulk-attendance', async (req, res) => {
  try {
    const today6pm = new Date();
    today6pm.setHours(18, 0, 0, 0); // today at 6 PM

    // Find volunteers who submitted after 6 PM
    const volunteers = await Volunteer.find({
      submittedAt: { $gte: today6pm }
    });

    if (!volunteers.length) {
      return res.status(404).json({ message: "No volunteers found after 6 PM." });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let added = 0, skipped = 0;

    for (const volunteer of volunteers) {
      // Check if attendance already exists for today
      const alreadyExists = await ManualAttendance.findOne({
        volunteer: volunteer._id,
        timestamp: { $gte: startOfToday, $lte: endOfToday }
      });

      if (alreadyExists) {
        skipped++;
        continue;
      }

      const attendance = new ManualAttendance({
        volunteer: volunteer._id,
        status: "Present"
      });

      await attendance.save();
      added++;
    }

    res.status(200).json({
      message: `Attendance processing completed.`,
      added,
      skipped
    });

  } catch (err) {
    console.error("Bulk attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// const ExcelJS = require('exceljs');

app.get('/api/attendance/export', async (req, res) => {
  try {
    const records = await ManualAttendance.find().populate('volunteer');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Columns: Name, Service Type, Phone, Status, Date
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Service Type', key: 'serviceType', width: 30 },
      { header: 'Phone', key: 'whatsappNumber', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    // Add rows
    records.forEach(record => {
      const v = record.volunteer || {};
      worksheet.addRow({
        name: v.name || '',
        serviceType: v.serviceType || '',
        whatsappNumber: v.whatsappNumber || '',
        status: record.status || '',
        date: new Date(record.date).toLocaleString()
      });
    });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_export.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
});

app.get('/export-by-manager', async (req, res) => {
  try {
    const managers = await Manager.find();

    if (!managers || managers.length === 0) {
      return res.status(404).json({ message: "No managers found." });
    }

    const exportDir = path.join(__dirname, 'manager_excels');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    // Cleanup previous files
    fs.readdirSync(exportDir).forEach(file => {
      fs.unlinkSync(path.join(exportDir, file));
    });

    for (const manager of managers) {
      const volunteers = await Volunteer.find({
        serviceType: manager.serviceType
      });

      if (!volunteers.length) continue;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Volunteers');

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Phone', key: 'whatsappNumber', width: 20 },
        { header: 'College/Company', key: 'collegeCompany', width: 30 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Locality', key: 'currentLocality', width: 30 },
        { header: 'Service Time', key: 'serviceAvailability', width: 20 },
        { header: 'Submitted At', key: 'submittedAt', width: 25 }
      ];

      volunteers.forEach(v => {
        worksheet.addRow({
          name: v.name,
          whatsappNumber: v.whatsappNumber,
          collegeCompany: v.collegeCompany,
          age: v.age,
          currentLocality: v.currentLocality,
          serviceAvailability: v.serviceAvailability,
          submittedAt: new Date(v.submittedAt).toLocaleString(),
        });
      });

      const safeFileName = `${manager.serviceType.replace(/\s+/g, '_')}_${manager.phone}.xlsx`;
      const filePath = path.join(exportDir, safeFileName);
      await workbook.xlsx.writeFile(filePath);
    }

    // Zip all files
    const zipPath = path.join(__dirname, 'all_managers.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(zipPath, 'managers.zip', () => {
        fs.rmSync(exportDir, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      });
    });

    archive.pipe(output);
    archive.directory(exportDir, false);
    archive.finalize();

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to generate Excel files." });
  }
});
app.get('/api/attendance1', async (req, res) => {
  try {
    const records = await ManualAttendance.find().populate('volunteer');

    // Prepare workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Volunteer Attendance');

    // Set columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'WhatsApp', key: 'whatsappNumber', width: 20 },
      { header: 'Service Type', key: 'serviceType', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    // Fill in data
    records.forEach((record) => {
      worksheet.addRow({
        name: record.volunteer?.name || 'N/A',
        whatsappNumber: record.volunteer?.whatsappNumber || 'N/A',
        serviceType: record.volunteer?.serviceType || 'N/A',
        status: record.status,
        date: new Date(record.date).toLocaleDateString('en-GB'),
      });
    });

    // Write to file or send directly
    const filePath = path.join(__dirname, 'Volunteer_Attendance_Records.xlsx');
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'Volunteer_Attendance_Records.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Could not download the file.');
      } else {
        fs.unlink(filePath, () => {}); // Optional: delete file after sending
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/bulk-attendance-count', async (req, res) => {
  try {
    // Target date: June 27, 2025 at 6:00 AM
    const afterDate = new Date(2025, 5, 27, 6, 0, 0); // Month is 0-indexed (June = 5)

    // Get volunteers who submitted after the date
    const volunteers = await Volunteer.find({
      submittedAt: { $gte: afterDate }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Volunteer Attendance Count');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'WhatsApp', key: 'whatsappNumber', width: 20 },
      { header: 'Service Type', key: 'serviceType', width: 30 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Current Locality', key: 'currentLocality', width: 20 },
    ];

    // Add data to worksheet
    volunteers.forEach((v) => {
      worksheet.addRow({
        name: v.name || 'N/A',
        whatsappNumber: v.whatsappNumber || 'N/A',
        serviceType: v.serviceType || 'N/A',
        gender: v.gender || 'N/A',
        currentLocality: v.currentLocality || 'N/A',
      });
    });

    // Save Excel file
    const filePath = path.join(__dirname, 'Spot_Registration.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Send file for download
    res.download(filePath, 'Spot_Registration.xlsx', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Could not download the file.');
      } else {
        fs.unlink(filePath, () => {}); // Optional: delete after sending
      }
    });

    // DO NOT send res.json() after res.download()
    // Remove this part:
    // res.status(200).json({
    //   message: `Volunteers submitted after 27-06-2025 6 AM: ${volunteers.length}`,
    //   count: volunteers
    // });

  } catch (err) {
    console.error("Error generating Excel:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/send-request', async (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, 'main.csv');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Collect everyone (no filter)
      results.push({
        name: row['NAME'],
        number: row['NUMBER'],
        volunteer: row['VOLUNTTER NAME'],
        response: row['PHONE CALL RESPONSE']
      });
    })
    .on('end', async () => {
     let count=5;
      for (const user of results) {
        // const message = `Hare Krishna ${user.name}, thank you for registering during Ratha Yatra! You're invited to our Youth Session on facing life challenges – 29th June, 6 PM at IIAM College, MVP. Join us!`;

        try {
          // Replace with your actual API call
          // await axios.post('https://your-api.com/send', {
          //   to: user.number,
          //   message: message
          // });
          // remove non-digits
           const oddNumber = user.number.replace(/\D/g, '');
           const fullNumber = oddNumber.length === 12 && oddNumber.startsWith("91") ? oddNumber : `91${oddNumber.slice(-10)}`; // take the last 10 digits

          const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '45b40c0a-3556-4f4e-857e-b513d0e408b1',
          params: [],
        },
        'src.name': 'Production',
        destination: '919392952946',
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
          console.log(`Message sent to ${user.name} (${fullNumber}):`, message.data);
      count++;
      if(count>5){
        break;
      }
          // console.log(`✅ Sent to ${user.name} (${fullNumber})`);
        } catch (err) {
          console.error(`❌ Failed for ${user.name} (${user.number}):`, err.message);
        }
      }

      res.send(`✅ Notifications sent to ${results.length} users.`);
    })
    .on('error', (err) => {
      console.error('❌ CSV parsing error:', err);
      res.status(500).send('Error reading the CSV file.');
    });
});
// 
const Attendance1= require('./models/fcuserdata');

// Helper function
function cleanStatus(status) {
  const s = status?.trim()?.toLowerCase();
  return s === "present" ? "Present" : s === "absent" ? "Absent" : null;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

app.get("/bulk-insert-attendance", async (req, res) => {
  const filePath = path.join(__dirname,"final.csv");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "CSV file not found." });
  }

  const records = [];
  const results = {
    inserted: [],
    duplicate: [],
    failed: [],
  };

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const normalized = {};
      for (const key in row) {
        normalized[key.trim().toLowerCase()] = row[key].trim();
      }

      const name = normalized["name"];
      const rawPhone = normalized["number"] || normalized["whatsapp number"];
      const status = cleanStatus(normalized["status"]);
      const date = parseDate(normalized["date"]);

      if (!name || !rawPhone) return;

      const cleanedPhone = rawPhone.replace(/\D/g, "").slice(-10); // last 10 digits

      records.push({
        name,
        phone: cleanedPhone,
        status,
        date,
      });
    })
    .on("end", async () => {
      for (const record of records) {
        try {
          const existing = await Attendance1.findOne({ phone: record.phone });
          if (existing) {
            results.duplicate.push(record.phone);
            continue;
          }

          const inserted = await Attendance1.create(record);
          results.inserted.push(inserted.phone);
        } catch (err) {
          results.failed.push({ phone: record.phone, error: err.message });
        }
      }

      res.json({
        message: "✅ Bulk attendance insertion complete.",
        total: records.length,
        ...results,
      });
    })
    .on("error", (err) => {
      console.error("CSV Parse Error:", err);
      res.status(500).json({ error: "Failed to process CSV." });
    });
});
app.get('/usersdata',async(req,res)=>{
  try{
      const users =await Attendance1.find({status: "Present"});
      return res.status(200).json(users);
  }
  catch(err){
    console.error("Error fetching users data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
app.post('/flcattendence', async (req, res) => {
  const { name, phone} = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name, phone and status are required." });
  }

  const cleanedPhone = phone.replace(/\D/g, "").slice(-10); // last 10 digits

  try {
    // Check if user already exists
    const existingUser = await Attendance1.findOne({ phone: cleanedPhone });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Create new attendance record
    const newAttendance = new Attendance1({
      name,
      phone: cleanedPhone,
    // Use provided date or current date
    });

    await newAttendance.save();
    res.status(201).json({ message: "Attendance saved successfully.", attendance: newAttendance });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get('/flcattendence/:phone', async (req, res) => {
  const { phone } = req.params;

  try {
    // Exclude serviceType field using projection
    const user = await Response.findOne({ whatsappNumber:phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/manual-flc-attendance', async (req, res) => {
  const { id, status } = req.body;

  if (!["Present", "Absent"].includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status." });
  }

  try {
    const existing = await Response.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    // if (existing.status==='Present') {
    //   return res.status(409).json({ message: "Attendance already submitted." });
    // }

       await Response.findByIdAndUpdate(id, {
      attendance: status,
      timestamp: new Date(),
    });


    res.status(200).json({ message: "Attendance saved." });

  } catch (err) {
    console.error("Manual attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/usersdata/excel', async (req, res) => {
  try {
    const users = await Attendance1.find({ status: "Present" });

    // Create workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Present Users');

    // Add column headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    // Add rows
    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        phone: user.phone,
        status: user.status,
        date: new Date(user.date).toLocaleString()
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=PresentUsers.xlsx'
    );

    // Send the workbook
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('Error generating Excel:', err);
    res.status(500).json({ message: 'Failed to generate Excel file' });
  }
});
// Route: GET /api/import-from-local


// Data: List of users with phone numbers
const users1 = [
  { name: "Kirasani Neelakantam", number: "9441364089" },
  { name: "Sreedhar Popuri", number: "9391661301" },
  { name: "Lakshmisrinivas", number: "9959599116" },
  { name: "Boina Sai Suresh", number: "8143212270" },
  { name: "Venkata rao", number: "9391158636" },
  { name: "Jaswanth", number: "7207674579" },
  { name: "Ekeswaranadh", number: "7675864099" },
  { name: "S sudharshan reddy", number: "7013309106" },
  { name: "Surisetty Arudra Arun Kumar", number: "9390540450" },
  { name: "Bhuvan Rishan", number: "9515690618" },
  { name: "Babitha", number: "9962942149" },
  { name: "B V SHYAM", number: "9030406336" },
  { name: "Kannababu", number: "9490743813" },
  { name: "Vijay Kumar", number: "9010189470" },
  { name: "Charan Teja", number: "7901219353" },
  { name: "Dinesh", number: "8465049121" },
  { name: "Sathwick Varma", number: "6301799946" },
  { name: "Aditya", number: "9652378598" },
  { name: "Omkar", number: "6303542751" },
  { name: "Dhruv K", number: "9327590531" },
  { name: "M Mahendar Goud", number: "9705864697" },
  { name: "Shobitha", number: "6302453806" },
  { name: "Sukanya", number: "9642488167" },
  { name: "Burle Ganesh", number: "9398093780" },
  { name: "P Vishal", number: "9398828390" },
  { name: "Mounika", number: "6305362713" },
  { name: "Ch Dithi Sree", number: "9581226962" },
  { name: "P Shaman Shouri", number: "9581226962" },
  { name: "Pusarla", number: "8499905307" },
  { name: "Trinadh", number: "9618787165" },
  { name: "D Yogesh Kumar", number: "7416316931" },
  { name: "Kedarnath", number: "7842429145" },
  { name: "Rella Chakravarthi", number: "7893104624" },
  { name: "Shiva", number: "9573976275" },
  { name: "Penaganti Maheshbabu", number: "8639347793" },
  { name: "K abhiram", number: "9182882588" },
  { name: "A Sai Saran", number: "8247083451" },
  { name: "Jayasurya", number: "9391252710" },
  { name: "Garikina Naveen", number: "9177852817" },
  { name: "K nikhil kumar", number: "9494246211" },
  { name: "T s naidu", number: "9963916014" },
  { name: "D ashwin", number: "9573697826" },
  { name: "Ravi kiran", number: "9398567417" }
];

// Message to send
// const message = "Hello! This is a test message.";

app.get('/send1', async (req, res) => {
  let count = 0;
  const result = [];

  try {
    const volunteer1 = await Response.find({gender:'Male'});

    for (const user of volunteer1) {
      const phone = user.whatsappNumber?.trim();

      // Check if this user already has status: "Present" in Attendance1
      const existing = await Attendance1.findOne({  phone, status: "Present" });
 const existing1 = users1.find(
        (user1) => user1.number?.trim() === phone
      );

      if (existing || existing1) {
        console.log(`❌ Skipping ${user.name} (${phone}) - already present or in users1`);
        continue; // Skip sending
      }

      // Build full number and add to result
      const fullNumber = `91${phone}`;
      console.log('hello')
      count++;
       const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: 'e7b1f573-e0ca-4359-b1d5-b77170e15385',
          params: [],
        },
        'src.name': 'Production',
        destination: fullNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
      // Optionally send message here
      // await gupshup.sendingTextTemplate({...});

      console.log(`✅ Sending to ${user.name} (${phone}) message:${message.data}`);
      result.push({
        name: user.name,
        phone,
        organization: user.organization,
        location: user.location
      });
    }

    console.log("Total messages to be sent:", count);
    res.json({ count, result });

  } catch (err) {
    console.error("Error in /send1:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/upload-from-file', async (req, res) => {
  const filePath = path.join(__dirname, 'Facing Life Challeneges (Responses) - MASTER (4).csv');

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'CSV file not found at path', path: filePath });
  }

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push({
        timestamp: new Date(data['Timestamp']),
        name: data['Name'],
        whatsappNumber: data['Whatsapp Number'],
        profession: data['Profession'],
        organization: data['College / Company Name'],
        age: parseInt(data['Age']) || null,
        gender: data['Gender'],
        location: data['Your Location'],
        attendance: 'Absent' // default value
      });
    })
    .on('end', async () => {
      try {
        const insertedDocs = await Response.insertMany(results);
        res.status(200).json({
          message: 'Data successfully uploaded from file',
          count: insertedDocs.length
        });
      } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
      }
    });
});
app.post('/userflc', async (req, res) => {
  try {
    const {
      timestamp,
      name,
      whatsappNumber,
      profession,
      organization,
      age,
      gender,
      location,
      attendance = 'Absent'
    } = req.body;

    const newUser = new Response({
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      name,
      whatsappNumber,
      profession,
      organization,
      age,
      gender,
      location,
      attendance
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User saved successfully', data: savedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save user', details: err.message });
  }
});
app.get('/1send1', async (req, res) => {
  try {
    let count = 0;
    const result = [];

    const volunteer1 = await Response.find({gender:'Male'});

    for (const user of volunteer1) {
      const existing = await Attendance1.findOne({
        phone: user.whatsappNumber,
        status: 'Present',

      });

      const existing1 = users1.find(
        (user1) => user1.number === user.whatsappNumber
      );

      if (existing || existing1) continue;

      count++;
      result.push(user);
    }

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Eligible Users');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'WhatsApp Number', key: 'whatsappNumber', width: 20 },
      { header: 'Profession', key: 'profession', width: 20 },
      { header: 'Organization', key: 'organization', width: 30 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Location', key: 'location', width: 25 },
      { header: 'Attendance', key: 'attendance', width: 10 },
      { header: 'Timestamp', key: 'timestamp', width: 25 }
    ];

    // Add data
    result.forEach(user => {
      worksheet.addRow({
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        profession: user.profession,
        organization: user.organization,
        age: user.age,
        gender: user.gender,
        location: user.location,
        attendance: user.attendance,
        timestamp: user.timestamp
      });
    });

    // Generate Excel file in memory and send
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=eligible_users.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error generating Excel:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/flcattendence1', async (req, res) => {
  try{
    const users = await Response.find({ attendance: "Present" });
    return res.json(users);
  }
  catch(err){
    console.error("Error fetching users data:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
const Candidate= require('./models/candidate');
const dayjs=require('dayjs');

const EVENT_DATE = dayjs("2025-08-15T09:00:00");
// const EVENT_DATE = dayjs("2025-08-15T09:00:00");

const sendMessage = async (candidate, label) => {
  console.log(`[${new Date().toISOString()}] Sending ${label} reminder to ${candidate.name} (${candidate.whatsappNumber})`);
  
};

const checkAndSendReminders = async () => {
  console.log(`[${new Date().toISOString()}] Running reminder check...`);

  const now = dayjs();
  const candidates = await Candidate.find();

  for (let candidate of candidates) {
    const diff = EVENT_DATE.diff(now, "millisecond");

    const reminders = [
      { label: "threeDay", offset: 3 * 24 * 60 * 60 * 1000 },
      { label: "twoDay", offset: 2 * 24 * 60 * 60 * 1000 },
      { label: "oneDay", offset: 1 * 24 * 60 * 60 * 1000 },
      { label: "twoHour", offset: 2 * 60 * 60 * 1000 },
    ];

    for (const { label, offset } of reminders) {
      const alreadySent = candidate.remindersSent?.[label];
      const withinRange = Math.abs(diff - offset) < 5 * 60 * 1000;

      if (!alreadySent && withinRange) {
        console.log(`[${new Date().toISOString()}] Reminder due for ${candidate.name} (${label})`);
        await sendMessage(candidate, label);
        candidate.remindersSent[label] = true;
      }
    }

    await candidate.save();
  }

  console.log(`[${new Date().toISOString()}] Reminder check completed.`);
};

// Run every 10 minutes
cron.schedule("*/1 * * * *", () => {
  console.log(`[${new Date().toISOString()}] Cron job triggered.`);
  checkAndSendReminders();
});

console.log("✅ Reminder cron job scheduled.");