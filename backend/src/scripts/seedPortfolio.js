import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';

const projects = [
  {
    title: 'Library Management System',
    slug: 'library-management-system',
    category: 'Full-stack web application',
    description: 'A web-based library management system designed to manage books, students, authentication and library operations through a structured digital interface.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MongoDB'],
    image: 'assets/images/project-library-preview.svg',
    featured: true,
    order: 1
  },
  {
    title: 'Surat BRTS Website',
    slug: 'surat-brts-website',
    category: 'Transportation website',
    description: 'A responsive website concept focused on presenting Surat BRTS information through a clean and accessible web interface.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    image: 'assets/images/project-brts-preview.svg',
    order: 2
  },
  {
    title: 'Kids Corner Website',
    slug: 'kids-corner-website',
    category: 'Responsive web experience',
    description: 'A visually engaging website concept created for a kid-friendly digital experience with a responsive interface.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    image: 'assets/images/project-kids-preview.svg',
    order: 3
  }
];

const skills = [
  ...['HTML', 'CSS', 'JavaScript'].map((name, index) => ({ name, category: 'Frontend Development', order: index + 1 })),
  { name: 'PHP', category: 'Backend Development', order: 4 },
  { name: 'MongoDB', category: 'Database', order: 5 },
  { name: 'MySQL', category: 'Database', order: 6 },
  ...['Git', 'GitHub', 'VS Code'].map((name, index) => ({ name, category: 'Development Tools', order: index + 7 }))
];

try {
  if (!await connectDatabase()) throw new Error('Set MONGODB_URI in backend/.env first.');
  for (const project of projects) {
    await Project.updateOne({ slug: project.slug }, { $setOnInsert: project }, { upsert: true });
  }
  for (const skill of skills) {
    await Skill.updateOne({ name: skill.name, category: skill.category }, { $setOnInsert: skill }, { upsert: true });
  }
  console.log('Genuine portfolio projects and listed skills are seeded without overwriting existing edits.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
