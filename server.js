require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

/* ✅ CORS – Allow all origins (Simplest & Most Robust for Dev) */
app.use(cors());

/* ✅ Middleware to parse JSON */
app.use(express.json());

/* ✅ Logging Middleware */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ✅ Supabase connection */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/* ✅ Mail transporter */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // APP PASSWORD
  },
});

/* ✅ Test Route */
app.get('/', (req, res) => {
  res.send('🚀 Mailer Server is Running! Send POST to /api/subscribe');
});

/* ✅ Subscribe API */
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Incoming subscription for:', email);

    if (!email) {
      console.warn('❌ Email missing in request body');
      return res.status(400).json({ error: 'Email is required' });
    }

    /* 1. Insert into Supabase */
    console.log('1. Attempting Supabase Insert...');
    const { data, error: dbError } = await supabase
      .from('user_emails')
      .insert([{ email }])
      .select();

    if (dbError) {
      // ✅ Handle Duplicate Email (Unique Constraint Violation)
      if (dbError.code === '23505') {
        console.log('⚠️ Email already exists in DB. Sending email anyway for testing...');
        // Do NOT return here. We proceed to send mail.
      } else {
        console.error('❌ Supabase Error:', dbError);
        return res.status(500).json({ error: 'Database save failed: ' + dbError.message });
      }
    } else {
      console.log('✅ Supabase Insert Success:', data);
    }

    /* 2. Send mail */
    console.log('2. Attempting to send email...');
    const mailOptions = {
      from: `"Marketing Dive" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Businesscale! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h1 style="color: #FF4500;">Welcome Aboard! 🎉</h1>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter. You've been successfully added to our database.</p>
          <p>Best regards,<br>The Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email Sent:', info.messageId);

    /* 3. Success Response */
    res.status(200).json({
      success: true,
      message: 'Subscribed and email sent successfully!'
    });

  } catch (err) {
    console.error('❌ Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
});

/* ✅ Start server */
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   - Test it: open http://localhost:${PORT} in browser`);
  console.log(`   - ready for POST /api/subscribe\n`);
});
