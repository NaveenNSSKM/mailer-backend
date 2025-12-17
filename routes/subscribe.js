const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const sendMailToUser = require('../services/mailer');

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // Insert into Supabase
  const { error } = await supabase
    .from('user_emails')
    .insert([{ email }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Send mail ONLY to this user
  await sendMailToUser(email);

  res.json({ success: true });
});

module.exports = router;
