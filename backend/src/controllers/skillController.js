import Skill from '../models/Skill.js';

export const listSkills = async (req, res) => {
  const skills = await Skill.find().sort({ order: 1, name: 1 }).lean();
  return res.json({ success: true, data: skills, message: 'Skills loaded successfully.' });
};

export const createSkill = async (req, res) => {
  const skill = await Skill.create(req.body);
  return res.status(201).json({ success: true, data: skill, message: 'Skill created successfully.' });
};

export const updateSkill = async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
  return res.json({ success: true, data: skill, message: 'Skill updated successfully.' });
};

export const deleteSkill = async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return res.status(404).json({ success: false, message: 'Skill not found.' });
  return res.json({ success: true, message: 'Skill deleted successfully.' });
};
