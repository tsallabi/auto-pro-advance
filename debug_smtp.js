import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/"/g, '')
  }
});

console.log('Testing SMTP connection for:', process.env.SMTP_USER);
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server reached successfully!');
  }
  process.exit();
});
