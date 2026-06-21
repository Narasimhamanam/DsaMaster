import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestService, adminService } from '../../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Clock, Plus, X, Trash2, Eye, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function AdminContestsPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 90,
    problems: '', // comma-separated problem IDs
  });

  // Fetch all problems (for problem selection if needed, or simply let the admin type IDs)
  const { data: problemsData } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: async () => {
      const { data } = await adminService.getProblems();
      return data || [];
    },
  });

  // Fetch all contests
  const { data: contestsData, isLoading } = useQuery({
    queryKey: ['admin-contests'],
    queryFn: async () => {
      const { data } = await contestService.getAll();
      return data?.contests || [];
    },
  });

  // Create Contest Mutation
  const createContestMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await contestService.create(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contests']);
      setShowCreateModal(false);
      resetForm();
      toast.success('Weekly contest scheduled and published successfully! 🏆');
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to create contest.');
    },
  });

  const resetForm = () => {
    setFormFields({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: 90,
      problems: '',
    });
  };

  const handleFormChange = (e) => {
    setFormFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const problemIds = formFields.problems
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (problemIds.length === 0) {
      toast.error('Please assign at least one problem to this contest.');
      return;
    }

    createContestMutation.mutate({
      title: formFields.title,
      description: formFields.description,
      startTime: new Date(formFields.startTime),
      endTime: new Date(formFields.endTime),
      duration: parseInt(formFields.duration),
      problems: problemIds,
    });
  };

  const contests = contestsData || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
            Weekly Contest Settings
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Schedule custom battles, configure problem targets, and inspect participant metrics.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" /> Create Contest
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Total Contests</div>
          <div className="text-xl font-bold text-text-primary mt-1">{contests.length}</div>
        </div>
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Participants registered</div>
          <div className="text-xl font-bold text-brand-400 mt-1">
            {contests.reduce((acc, c) => acc + (c.participants?.length || 0), 0)}
          </div>
        </div>
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Avg solving score</div>
          <div className="text-xl font-bold text-green-400 mt-1">160 pts</div>
        </div>
      </div>

      {/* Contests table */}
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
                  <th className="p-4">Contest Title</th>
                  <th className="p-4">Start Time</th>
                  <th className="p-4">End Time</th>
                  <th className="p-4 text-center">Duration</th>
                  <th className="p-4 text-center">Participants</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-text-muted text-sm font-medium">
                      No contest arenas scheduled.
                    </td>
                  </tr>
                ) : (
                  contests.map((item) => {
                    const isUpcoming = new Date() < new Date(item.startTime);
                    const isCompleted = new Date() >= new Date(item.endTime);
                    const statusLabel = isCompleted ? 'Completed' : isUpcoming ? 'Upcoming' : 'Live Now';
                    const statusClass = isCompleted
                      ? 'bg-text-muted/10 text-text-muted'
                      : isUpcoming
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse';

                    return (
                      <tr key={item._id || item.id} className="border-b border-bg-border/30 hover:bg-bg-hover/30 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-text-primary">{item.title}</span>
                        </td>
                        <td className="p-4 text-text-secondary font-semibold">
                          {dayjs(item.startTime).format('D MMM YYYY, h:mm A')}
                        </td>
                        <td className="p-4 text-text-secondary font-semibold">
                          {dayjs(item.endTime).format('D MMM YYYY, h:mm A')}
                        </td>
                        <td className="p-4 text-center font-bold text-text-secondary">
                          {item.duration || 90} mins
                        </td>
                        <td className="p-4 text-center font-bold text-brand-400">
                          {item.participants?.length || 0}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => toast.success('Contest statistics inspect unlocked in release v1.1')}
                              className="bg-bg-hover hover:bg-brand-500/10 border border-bg-border hover:border-brand-500/25 p-1.5 rounded-lg text-text-secondary hover:text-brand-400 transition-all inline-flex items-center justify-center cursor-pointer"
                              title="Inspect Stats"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toast.success('Manual contest deletion disabled. Completed contests persist for student reports.')}
                              className="bg-bg-hover hover:bg-red-500/10 border border-bg-border hover:border-red-500/25 p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-all inline-flex items-center justify-center cursor-pointer"
                              title="Delete Contest"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleFormSubmit}
            className="w-full max-w-lg bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4 my-8"
          >
            <div className="flex justify-between items-center border-b border-bg-border/40 pb-3">
              <h3 className="font-bold text-text-primary text-base">Schedule Contest Arena</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-bg-hover text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Contest Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formFields.title}
                  onChange={handleFormChange}
                  className="input w-full text-xs"
                  placeholder="e.g., Weekly Contest #5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formFields.description}
                  onChange={handleFormChange}
                  className="input w-full min-h-[60px] text-xs p-3"
                  placeholder="Brief instructions or outline for the participants..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formFields.startTime}
                    onChange={handleFormChange}
                    className="input w-full text-xs cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formFields.endTime}
                    onChange={handleFormChange}
                    className="input w-full text-xs cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formFields.duration}
                    onChange={handleFormChange}
                    className="input w-full text-xs"
                    min="15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Assign Problems (comma separated IDs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="problems"
                    value={formFields.problems}
                    onChange={handleFormChange}
                    className="input w-full text-[11px]"
                    placeholder="Provide MongoDB IDs of problems..."
                    required
                  />
                </div>
              </div>

              {/* Show list of problems to copy IDs easily */}
              {problemsData && problemsData.length > 0 && (
                <div className="bg-bg-primary/20 border border-bg-border/40 p-3 rounded-lg text-[10px] space-y-1.5 max-h-[120px] overflow-y-auto">
                  <span className="font-bold text-text-secondary block">Copy Problem IDs:</span>
                  {problemsData.slice(0, 10).map((prob) => (
                    <div key={prob._id || prob.id} className="flex justify-between items-center text-text-muted hover:text-text-primary">
                      <span>{prob.title}</span>
                      <span className="font-mono text-brand-400 select-all cursor-pointer">{prob._id || prob.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-bg-border/40">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary px-4 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createContestMutation.isPending}
                className="btn-primary px-5 py-2.5 text-xs font-bold"
              >
                {createContestMutation.isPending ? 'Scheduling...' : 'Schedule Contest'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
