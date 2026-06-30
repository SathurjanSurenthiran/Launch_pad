import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import Button from '../../components/ui/Button';
import TagInput from '../../components/ui/TagInput';
import ImageUpload from '../../components/ui/ImageUpload';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [demoLink, setDemoLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isValidUrl = (val) => {
    if (!val) return true;
    try {
      const url = new URL(val);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Project title is required.';
    } else if (title.length > 150) {
      errs.title = 'Title must be 150 characters or less.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.length > 5000) {
      errs.description = 'Description must be 5000 characters or less.';
    }

    if (!category) {
      errs.category = 'Please select a project category.';
    }

    if (!coverImage) {
      errs.coverImage = 'Cover image is required.';
    }

    if (demoLink.trim() && !isValidUrl(demoLink.trim())) {
      errs.demoLink = 'Must be a valid URL including http:// or https://';
    }

    if (githubLink.trim() && !isValidUrl(githubLink.trim())) {
      errs.githubLink = 'Must be a valid URL including http:// or https://';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('techStack', techStack.join(','));

      if (demoLink.trim()) formData.append('demoLink', demoLink.trim());
      if (githubLink.trim()) formData.append('githubLink', githubLink.trim());
      if (coverImage) formData.append('coverImage', coverImage);

      if (images && images.length > 0) {
        images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await projectService.createProject(formData);
      const newId = response.data?.data?._id;

      toast.success('Project submitted for review!');
      navigate(`/projects/${newId}`);
    } catch (error) {
      console.error('Failed to submit project:', error);
      const msg = error.response?.data?.message || 'Failed to submit project. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Create a New Project
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share your innovation. It will be reviewed by administrators before going live.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Project Title <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {title.length}/150
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 150))}
            placeholder="e.g. LaunchPad Student Portal"
            className={`w-full px-3 py-2.5 rounded-xl border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
              } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
          />
          {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {description.length}/5000
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
            placeholder="Describe the features, problem statement, build process, and challenges..."
            rows={6}
            className={`w-full px-3 py-2.5 rounded-xl border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
              } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
          />
          {errors.description && <p className="text-xs text-red-500 font-semibold">{errors.description}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
              } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 dark:text-gray-300`}
          >
            <option value="">Select a Category</option>
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500 font-semibold">{errors.category}</p>}
        </div>

        {/* Tech Stack */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tech Stack (Max 10 tags)
          </label>
          <TagInput
            tags={techStack}
            onChange={setTechStack}
            maxTags={10}
            placeholder="Type technology name (e.g. React) and press Enter or comma"
          />
        </div>

        {/* Links row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demo Link */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Live Demo URL
            </label>
            <input
              type="text"
              value={demoLink}
              onChange={(e) => setDemoLink(e.target.value)}
              placeholder="https://example.com"
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.demoLink ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
            />
            {errors.demoLink && <p className="text-xs text-red-500 font-semibold">{errors.demoLink}</p>}
          </div>

          {/* GitHub Link */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              GitHub URL
            </label>
            <input
              type="text"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/username/project"
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.githubLink ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
            />
            {errors.githubLink && <p className="text-xs text-red-500 font-semibold">{errors.githubLink}</p>}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-1.5">
          <ImageUpload
            label="Cover Image (Required)"
            multiple={false}
            value={coverImage}
            onChange={setCoverImage}
          />
          {errors.coverImage && <p className="text-xs text-red-500 font-semibold">{errors.coverImage}</p>}
        </div>

        {/* Gallery Upload */}
        <div className="space-y-1.5">
          <ImageUpload
            label="Gallery Screenshots (Optional, Max 5)"
            multiple={true}
            maxFiles={5}
            value={images}
            onChange={setImages}
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/projects')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
            className="font-bold shadow-sm"
          >
            Submit Project
          </Button>
        </div>
      </form>
    </div>
  );
}
