import Project from '../models/Project.js';
import { slugify } from '../utils/slugify.js';

const projectFields = (body) => ({
  title: body.title,
  slug: body.slug || slugify(body.title),
  category: body.category,
  description: body.description,
  technologies: body.technologies || [],
  image: body.image || '',
  githubUrl: body.githubUrl || '',
  liveUrl: body.liveUrl || '',
  featured: body.featured ?? false,
  order: body.order ?? 0
});

export const listProjects = async (req, res) => {
  const projects = await Project.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean();
  return res.json({ success: true, data: projects, message: 'Projects loaded successfully.' });
};

export const getProject = async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug }).lean();
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
  return res.json({ success: true, data: project, message: 'Project loaded successfully.' });
};

export const createProject = async (req, res) => {
  const project = await Project.create(projectFields(req.body));
  return res.status(201).json({ success: true, data: project, message: 'Project created successfully.' });
};

export const updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, projectFields(req.body), {
    new: true,
    runValidators: true
  });
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
  return res.json({ success: true, data: project, message: 'Project updated successfully.' });
};

export const deleteProject = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
  return res.json({ success: true, message: 'Project deleted successfully.' });
};
