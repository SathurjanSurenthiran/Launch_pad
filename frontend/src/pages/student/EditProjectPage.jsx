import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/project.service';
import Button from '../../components/ui/Button';
import TagInput from '../../components/ui/TagInput';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function EditProjectPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [demoLink, setDemoLink] = useState('');
  const [githubLink, setGithubLink] = useState('');

  // Existing assets from DB
  const [existingCoverUrl, setExistingCoverUrl] = useState('');
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);

  // New assets uploaded by user
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getProjectById(id);
        const proj = response.data?.data;
        if (!proj) {
          toast.error('Project not found.');
          navigate('/');
          return;
        }

        // Validate Ownership
        const currentUserId = user?._id || user?.id || user?.userId;
        const ownerId = proj.owner?._id || proj.owner?.id || proj.owner;
        if (currentUserId && ownerId && currentUserId.toString() === ownerId.toString()) {
          setIsOwner(true);
        } else {
          toast.error('You are not authorized to edit this project.');
          navigate('/');
          return;
        }

        // Populate fields
        setTitle(proj.title || '');
        setDescription(proj.description || '');
        setCategory(proj.category || '');
        setTechStack(proj.techStack || []);
        setDemoLink(proj.demoLink || '');
        setGithubLink(proj.githubLink || '');
        setExistingCoverUrl(proj.coverImage || '');
        setExistingGalleryUrls(proj.images || []);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load project details:', error);
        toast.error('Failed to retrieve project details.');
        navigate('/');
      }
    };

    if (isAuthenticated && user) {
      fetchProject();
    }
  }, [id, user, isAuthenticated, navigate]);

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
      toast.error('Please correct the validation errors before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('techStack', techStack.join(','));

      if (demoLink.trim() !== undefined) formData.append('demoLink', demoLink.trim());
      if (githubLink.trim() !== undefined) formData.append('githubLink', githubLink.trim());

      // If user uploaded a new cover image File, append it.
      if (newCoverFile) {
        formData.append('coverImage', newCoverFile);
      }

      // If user uploaded new screenshots, append them.
      if (newGalleryFiles && newGalleryFiles.length > 0) {
        newGalleryFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      await projectService.updateProject(id, formData);
      toast.success('Project updated!');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      const msg = error.response?.data?.message || 'Failed to update project. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Alert Info Banner */}
      <div className="bg-violet-50 dark:bg-violet-950/20 border-l-4 border-violet-500 p-4 rounded-xl flex items-start gap-3 shadow-xxs">
        <span className="text-xl">ℹ️</span>
        <div>
          <h4 className="font-bold text-violet-800 dark:text-violet-400">Status Reset Notice</h4>
          <p className="text-sm text-violet-750 dark:text-violet-300 mt-1 leading-relaxed">
            Saving changes will reset your project status to <strong>Pending</strong> review. Administrators will need to re-approve the updates before they appear publicly.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Edit Project Details
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify details of your project submission below.
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
          />
        </div>

        {/* Links row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Live Demo URL
            </label>
            <input
              type="text"
              value={demoLink}
              onChange={(e) => setDemoLink(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.demoLink ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
            />
            {errors.demoLink && <p className="text-xs text-red-500 font-semibold">{errors.demoLink}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              GitHub URL
            </label>
            <input
              type="text"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.githubLink ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
            />
            {errors.githubLink && <p className="text-xs text-red-500 font-semibold">{errors.githubLink}</p>}
          </div>
        </div>

        {/* Cover Image Upload (Existing + Change option) */}
        <div className="space-y-3.5">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Cover Image
          </label>
          {existingCoverUrl && !newCoverFile ? (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video max-h-[220px] bg-gray-50 dark:bg-gray-900">
              <img src={existingCoverUrl} alt="Current Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setExistingCoverUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-650 text-white rounded-full transition-colors focus:outline-none"
              >
                Change Cover Image
              </button>
            </div>
          ) : (
            <ImageUpload
              value={newCoverFile}
              onChange={setNewCoverFile}
              multiple={false}
            />
          )}
        </div>

        {/* Gallery Upload (Existing + Upload new option) */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Gallery screenshots
            </label>
            <p className="text-xs text-gray-500">
              ℹ️ Note: Uploading new screenshots will overwrite all existing screenshots. Leave this blank to keep existing ones.
            </p>
          </div>

          {/* Existing Previews */}
          {existingGalleryUrls.length > 0 && newGalleryFiles.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Screenshots:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {existingGalleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Screenshots Upload area */}
          <div className="space-y-2">
            {existingGalleryUrls.length > 0 && newGalleryFiles.length === 0 ? (
              <Button
                variant="secondary"
                onClick={() => setExistingGalleryUrls([])}
                className="text-xs font-semibold"
              >
                Replace Existing Screenshots
              </Button>
            ) : (
              <ImageUpload
                multiple={true}
                maxFiles={5}
                value={newGalleryFiles}
                onChange={setNewGalleryFiles}
              />
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${id}`)}
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
