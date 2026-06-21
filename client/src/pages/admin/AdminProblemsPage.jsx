import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, problemService } from '../../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Edit, Plus, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProblemsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null); // null = add new, object = editing
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Form State
  const [formFields, setFormFields] = useState({
    title: '',
    topicId: 'arrays-hashing',
    topicName: 'Arrays & Hashing',
    difficulty: 'Easy',
    leetcodeUrl: '',
    gfgUrl: '',
    videoUrl: '',
    tags: '',
    xpReward: 100,
    companies: '',
  });

  // Fetch all problems
  const { data: problemsData, isLoading } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: async () => {
      const { data } = await adminService.getProblems();
      return data || [];
    },
  });

  // Fetch topics list
  const { data: topicsData } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: async () => {
      const { data } = await adminService.getTopics();
      return data || [];
    },
  });

  // Create Problem Mutation
  const createProblemMutation = useMutation({
    mutationFn: async (data) => {
      const { data: res } = await adminService.createProblem(data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-problems']);
      setShowFormModal(false);
      resetForm();
      toast.success('Problem added successfully to database! 📦');
    },
    onError: () => {
      toast.error('Failed to create problem.');
    },
  });

  // Edit Problem Mutation
  const updateProblemMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: res } = await adminService.updateProblem(id, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-problems']);
      setShowFormModal(false);
      resetForm();
      toast.success('Problem parameters updated successfully! 🛠️');
    },
    onError: () => {
      toast.error('Failed to update problem.');
    },
  });

  // Delete Problem Mutation
  const deleteProblemMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await adminService.deleteProblem(id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-problems']);
      setShowDeleteModal(null);
      toast.success('Problem removed from database.');
    },
    onError: () => {
      toast.error('Failed to delete problem.');
    },
  });

  const resetForm = () => {
    setFormFields({
      title: '',
      topicId: 'arrays-hashing',
      topicName: 'Arrays & Hashing',
      difficulty: 'Easy',
      leetcodeUrl: '',
      gfgUrl: '',
      videoUrl: '',
      tags: '',
      xpReward: 100,
      companies: '',
    });
    setSelectedProblem(null);
  };

  const handleOpenEdit = (problem) => {
    setSelectedProblem(problem);
    setFormFields({
      title: problem.title || '',
      topicId: problem.topicId || 'arrays-hashing',
      topicName: problem.topicName || 'Arrays & Hashing',
      difficulty: problem.difficulty || 'Easy',
      leetcodeUrl: problem.leetcodeUrl || '',
      gfgUrl: problem.gfgUrl || '',
      videoUrl: problem.videoUrl || '',
      tags: problem.tags?.join(', ') || '',
      xpReward: problem.xpReward || 100,
      companies: problem.companies?.join(', ') || '',
    });
    setShowFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'topicId') {
      const topicObj = (topicsData || []).find((t) => t.id === value);
      setFormFields((prev) => ({
        ...prev,
        topicId: value,
        topicName: topicObj ? topicObj.name : 'Unknown Topic',
      }));
    } else {
      setFormFields((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formFields,
      tags: formFields.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
      companies: formFields.companies.split(',').map((c) => c.trim()).filter((c) => c.length > 0),
      xpReward: parseInt(formFields.xpReward),
    };

    if (selectedProblem) {
      updateProblemMutation.mutate({ id: selectedProblem._id || selectedProblem.id, data: payload });
    } else {
      createProblemMutation.mutate(payload);
    }
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!showDeleteModal) return;
    deleteProblemMutation.mutate(showDeleteModal._id || showDeleteModal.id);
  };

  // Filter logic
  const filteredProblems = (problemsData || []).filter((prob) => {
    const matchesSearch = prob.title?.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter ? prob.topicId === topicFilter : true;
    const matchesDiff = difficultyFilter ? prob.difficulty?.toLowerCase() === difficultyFilter.toLowerCase() : true;
    return matchesSearch && matchesTopic && matchesDiff;
  });

  const diffColors = {
    easy: 'text-green-400 border-green-500/20 bg-green-500/5',
    medium: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    hard: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
            Problem Inventory
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Add new algorithmic challenges, configure roadmap placement rewards, and edit URL targets.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowFormModal(true);
          }}
          className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Problem
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="input w-full pl-10 text-xs py-2"
          />
        </div>

        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Topics</option>
          {(topicsData || []).map((t) => (
            <option key={t.id || t._id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Cohort Table */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse pt-4">
          <div className="h-48 bg-bg-card rounded-2xl w-full" />
        </div>
      ) : (
        <div className="glass-card bg-bg-secondary/40 border-bg-border/60 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-bg-border/60 text-text-muted font-semibold bg-bg-secondary/20">
                  <th className="p-4">Problem</th>
                  <th className="p-4">Topic Area</th>
                  <th className="p-4 text-center">Difficulty</th>
                  <th className="p-4 text-center">XP Reward</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-text-muted text-sm font-medium">
                      No problems in list.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => (
                    <tr key={prob._id || prob.id} className="border-b border-bg-border/30 hover:bg-bg-hover/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text-primary flex items-center gap-1.5">
                          {prob.title}
                          {prob.leetcodeUrl && (
                            <a
                              href={prob.leetcodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-muted hover:text-text-primary"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-text-secondary font-semibold">
                        {prob.topicName}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${diffColors[prob.difficulty?.toLowerCase()] || ''}`}>
                          {prob.difficulty}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-brand-400">
                        {prob.xpReward || 100} XP
                      </td>

                      <td className="p-4 text-text-muted">
                        {prob.tags?.join(', ')}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(prob)}
                            className="bg-bg-hover hover:bg-brand-500/10 border border-bg-border hover:border-brand-500/25 p-1.5 rounded-lg text-text-secondary hover:text-brand-400 transition-all inline-flex items-center justify-center cursor-pointer"
                            title="Edit Parameters"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(prob)}
                            className="bg-bg-hover hover:bg-red-500/10 border border-bg-border hover:border-red-500/25 p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-all inline-flex items-center justify-center cursor-pointer"
                            title="Delete problem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleFormSubmit}
            className="w-full max-w-lg bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-bg-border/40 pb-3">
              <h3 className="font-bold text-text-primary text-base">
                {selectedProblem ? 'Edit Problem Parameters' : 'Add New Problem'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Problem Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formFields.title}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Topic Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="topicId"
                  value={formFields.topicId}
                  onChange={handleFormChange}
                  className="input w-full text-xs cursor-pointer"
                >
                  {(topicsData || []).map((t) => (
                    <option key={t.id || t._id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Difficulty <span className="text-red-500">*</span>
                </label>
                <select
                  name="difficulty"
                  value={formFields.difficulty}
                  onChange={handleFormChange}
                  className="input w-full text-xs cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  LeetCode URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="leetcodeUrl"
                  value={formFields.leetcodeUrl}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  placeholder="https://leetcode.com/problems/..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  name="xpReward"
                  value={formFields.xpReward}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  min="10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formFields.tags}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  placeholder="Arrays, Hash Table, Google"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Companies (comma separated)
                </label>
                <input
                  type="text"
                  name="companies"
                  value={formFields.companies}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  placeholder="Google, Amazon, Meta"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-bg-border/40">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="btn-secondary px-4 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProblemMutation.isPending || updateProblemMutation.isPending}
                className="btn-primary px-5 py-2.5 text-xs font-bold"
              >
                {createProblemMutation.isPending || updateProblemMutation.isPending ? 'Saving...' : 'Save Problem'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleDeleteSubmit}
            className="w-full max-w-sm bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4"
          >
            <div>
              <h3 className="font-bold text-text-primary text-base">Confirm Problem Deletion</h3>
              <p className="text-text-muted text-xs mt-1">
                Are you sure you want to delete <span className="font-semibold text-text-primary">{showDeleteModal.title}</span>? This action deletes this problem from roadmap references.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteProblemMutation.isPending}
                className="btn-primary px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 border-red-500"
              >
                {deleteProblemMutation.isPending ? 'Deleting...' : 'Yes, Delete Problem'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
