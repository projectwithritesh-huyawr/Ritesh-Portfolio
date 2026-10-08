import Message from '../models/Message.js';

const validId = (id) => /^[a-f\d]{24}$/i.test(id);

export const listMessages = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const messages = await Message.find(filter).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: messages, message: 'Messages loaded successfully.' });
};

export const getMessage = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid message ID.' });
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
  if (message.status === 'unread') {
    message.status = 'read';
    await message.save();
  }
  return res.json({ success: true, data: message, message: 'Message loaded successfully.' });
};

export const updateMessageStatus = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid message ID.' });
  const message = await Message.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
    new: true,
    runValidators: true
  });
  if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
  return res.json({ success: true, data: message, message: 'Message status updated successfully.' });
};

export const deleteMessage = async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid message ID.' });
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
  return res.json({ success: true, message: 'Message deleted successfully.' });
};
