import { createHmac } from 'node:crypto';
import Visitor from '../models/Visitor.js';

export const recordVisit = async (req, res) => {
  const secret = process.env.VISITOR_HASH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, message: 'Visitor tracking is not configured.' });
  }

  const ipHash = createHmac('sha256', secret).update(req.ip || 'unknown').digest('hex');
  await Visitor.create({
    ipHash,
    userAgent: (req.get('user-agent') || '').slice(0, 300),
    page: req.body.page
  });
  return res.status(202).json({ success: true, message: 'Visit recorded.' });
};

export const getVisitorStats = async (req, res) => {
  const [totalVisits, recentVisits, popularPages] = await Promise.all([
    Visitor.countDocuments(),
    Visitor.find().sort({ visitedAt: -1 }).limit(10).select('page visitedAt').lean(),
    Visitor.aggregate([
      { $group: { _id: '$page', visits: { $sum: 1 } } },
      { $sort: { visits: -1, _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, page: '$_id', visits: 1 } }
    ])
  ]);
  return res.json({
    success: true,
    data: { totalVisits, recentVisits, popularPages },
    message: 'Visitor statistics loaded successfully.'
  });
};
