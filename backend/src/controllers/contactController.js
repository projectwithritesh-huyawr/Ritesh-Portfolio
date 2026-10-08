import nodemailer from 'nodemailer';
import Message from '../models/Message.js';

const emailIsConfigured = () => [
  'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM', 'ADMIN_EMAIL'
].every((key) => process.env[key]);

export const submitContact = async (req, res) => {
  const savedMessage = await Message.create({ ...req.body, status: 'unread' });
  let responseMessage = 'Your message has been sent successfully.';

  if (!emailIsConfigured()) {
    responseMessage = 'Your message was saved. Email notifications are not configured yet.';
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.ADMIN_EMAIL,
        replyTo: req.body.email,
        subject: `Portfolio contact: ${req.body.subject}`,
        text: `Name: ${req.body.name}\nEmail: ${req.body.email}\n\n${req.body.message}`
      });
    } catch (error) {
      console.error('Contact notification email could not be delivered.');
      responseMessage = 'Your message was saved, but the email notification could not be delivered.';
    }
  }

  return res.status(201).json({
    success: true,
    data: { id: savedMessage.id },
    message: responseMessage
  });
};
