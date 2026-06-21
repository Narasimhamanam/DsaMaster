import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemService, forumService } from '../services/services';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronLeft,
  MessageSquare,
  ThumbsUp,
  StickyNote,
  User,
  Plus,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('notes'); // notes, discussion
  const [notes, setNotes] = useState('');
  const [forumSort, setForumSort] = useState('latest'); // latest, upvotes
  const [newComment, setNewComment] = useState('');

  // Fetch problem details
  const { data: problemData, isLoading: isProblemLoading, error: problemError } = useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const { data } = await problemService.getById(id);
      // Prepopulate notes state
      if (data?.userProgress?.notes) {
        setNotes(data.userProgress.notes);
      }
      return data;
    },
  });

  // Fetch forum posts
  const { data: forumData, isLoading: isForumLoading, refetch: refetchForum } = useQuery({
    queryKey: ['forum', id, forumSort],
    queryFn: async () => {
      const { data } = await forumService.getByProblem(id, forumSort);
      return data || [];
    },
    enabled: activeTab === 'discussion', // Fetch only when discussion tab is active
  });

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async (notesText) => {
      const { data } = await problemService.saveNotes(id, notesText);
      return data;
    },
    onSuccess: () => {
      toast.success('Notes saved automatically.');
      queryClient.invalidateQueries(['problem', id]);
    },
  });

  const handleNotesBlur = () => {
    if (problemData?.userProgress?.notes !== notes) {
      saveNotesMutation.mutate(notes);
    }
  };

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      if (status === 'not_started') {
        const { data } = await problemService.resetProgress(id);
        return { status, response: data };
      } else {
        const { data } = await problemService.updateProgress(id, status);
        return { status, response: data };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['problem', id]);
      queryClient.invalidateQueries(['topics']);
      queryClient.invalidateQueries(['dashboard']);
      if (data.status === 'solved') {
        toast.success(`Problem marked as solved! +${data.response.xpEarned || data.response.xpGained || 100} XP ⭐`);
      } else if (data.status === 'attempted') {
        toast.success('Problem marked as attempted.');
      } else {
        toast.success('Problem progress reset.');
      }
    },
    onError: () => {
      toast.error('Failed to update progress.');
    },
  });

  // Post comment mutation
  const createPostMutation = useMutation({
    mutationFn: async (content) => {
      const { data } = await forumService.createPost({
        problemId: id,
        content,
      });
      return data;
    },
    onSuccess: () => {
      setNewComment('');
      refetchForum();
      toast.success('Comment posted successfully.');
    },
    onError: (err) => {
      toast.error('Failed to post comment.');
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createPostMutation.mutate(newComment);
  };

  // Upvote comment mutation
  const upvoteMutation = useMutation({
    mutationFn: async (commentId) => {
      const { data } = await forumService.upvote(commentId);
      return data;
    },
    onSuccess: () => {
      refetchForum();
    },
  });

  if (isProblemLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pt-6 animate-pulse">
        <div className="h-6 w-32 bg-bg-card rounded-md" />
        <div className="h-44 bg-bg-card rounded-2xl w-full" />
        <div className="h-64 bg-bg-card rounded-2xl w-full" />
      </div>
    );
  }

  if (problemError || !problemData?.problem) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-text-primary">Problem Not Found</h2>
        <p className="text-text-muted mt-2">The problem details could not be retrieved.</p>
        <button onClick={() => navigate('/roadmap')} className="btn-primary mt-6 px-6 py-2.5">
          Back to Roadmap
        </button>
      </div>
    );
  }

  const problem = problemData?.problem || {};
  const progress = problemData?.userProgress || {};
  const status = progress?.status || 'not_started';

  const diffColors = {
    easy: 'text-green-400 bg-green-500/10 border-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-4 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(`/roadmap/${problem.topicId || 'arrays-hashing'}`)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Topic
      </button>

      {/* Main Info Card */}
      <div className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-bg-border/40 pb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${diffColors[problem.difficulty?.toLowerCase()]}`}>
                {problem.difficulty}
              </span>
              <span className="text-xs text-text-muted bg-bg-hover px-2.5 py-0.5 rounded-full border border-bg-border">
                {problem.topicName}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-2">
              {problem.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <span className="text-xs text-text-muted mr-2">Status:</span>
            {status === 'solved' ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl font-bold">
                <CheckCircle2 className="w-4 h-4" /> Solved
              </span>
            ) : status === 'attempted' ? (
              <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl font-bold">
                <AlertCircle className="w-4 h-4" /> Attempted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg-hover border border-bg-border px-3 py-1.5 rounded-xl font-bold">
                <Circle className="w-4 h-4" /> Not Started
              </span>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5">
          <div className="flex gap-2">
            {problem.leetcodeUrl && (
              <a
                href={problem.leetcodeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                LeetCode <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {problem.gfgUrl && (
              <a
                href={problem.gfgUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                GeeksforGeeks <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status !== 'solved' && (
              <button
                onClick={() => updateStatusMutation.mutate('solved')}
                disabled={updateStatusMutation.isPending}
                className="bg-green-500/10 hover:bg-green-500/25 border border-green-500/20 hover:border-green-500/40 text-green-400 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                Mark as Solved
              </button>
            )}
            {status !== 'attempted' && (
              <button
                onClick={() => updateStatusMutation.mutate('attempted')}
                disabled={updateStatusMutation.isPending}
                className="bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
              >
                Mark as Attempted
              </button>
            )}
            {status !== 'not_started' && (
              <button
                onClick={() => updateStatusMutation.mutate('not_started')}
                disabled={updateStatusMutation.isPending}
                className="bg-bg-hover border border-bg-border hover:bg-red-500/10 hover:text-red-400 text-xs px-4 py-2 rounded-xl text-text-muted transition-all"
              >
                Reset Progress
              </button>
            )}
          </div>
        </div>

        {/* Tags & Meta */}
        <div className="mt-6 pt-5 border-t border-bg-border/30 flex flex-wrap gap-4 text-xs">
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted font-medium">Tags:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {problem.tags.map((t, i) => (
                  <span key={i} className="bg-bg-hover border border-bg-border px-2 py-0.5 rounded text-[11px] text-text-secondary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {problem.companies && problem.companies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted font-medium">Companies:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {problem.companies.map((c, i) => (
                  <span key={i} className="bg-brand-500/5 border border-brand-500/10 text-brand-400 px-2 py-0.5 rounded text-[11px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="ml-auto text-[11px] text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/15 font-bold">
            Reward: +{problem.xpReward || 100} XP
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-bg-border/60 pb-1.5">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-bg-hover text-brand-400 border border-bg-border'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <StickyNote className="w-4 h-4" /> Personal Notes
        </button>
        <button
          onClick={() => setActiveTab('discussion')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'discussion'
              ? 'bg-bg-hover text-brand-400 border border-bg-border'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Discussion Forum
        </button>
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === 'notes' ? (
          <div className="glass-card p-5 space-y-3 bg-bg-secondary/40 border-bg-border/60">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Write your private notes or solution outline here. Auto-saves on click outside.</span>
              {saveNotesMutation.isPending && <span>Saving...</span>}
            </div>
            <textarea
              className="input w-full min-h-[250px] font-mono text-sm leading-relaxed p-4 bg-bg-primary/50 focus:bg-bg-primary/80"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Write your notes here... (e.g., approach, code logic, pitfalls to avoid)"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Discussion Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
              <div className="text-xs font-semibold text-text-muted uppercase">
                Peer & Mentor Solutions
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Sort by:</span>
                <select
                  value={forumSort}
                  onChange={(e) => setForumSort(e.target.value)}
                  className="bg-bg-hover border border-bg-border text-xs text-text-secondary rounded-lg px-2 py-1 cursor-pointer"
                >
                  <option value="latest">Latest</option>
                  <option value="upvotes">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* Comments List */}
            {isForumLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-bg-card rounded-lg" />
                <div className="h-20 bg-bg-card rounded-lg" />
              </div>
            ) : (forumData || []).length === 0 ? (
              <div className="text-center py-12 glass-card bg-bg-secondary/15">
                <MessageSquare className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <div className="text-text-secondary font-medium">No discussions yet</div>
                <p className="text-text-muted text-xs mt-1">Be the first to share your solution approach or ask a question!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(forumData || []).map((post) => {
                  const isMentor = post.user?.role === 'mentor' || post.user?.role === 'admin';
                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-card p-5 bg-bg-secondary/40 border-bg-border/60 ${
                        isMentor ? 'border-l-4 border-l-brand-500 bg-brand-500/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-bg-border/30 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.user?.photoURL || 'https://via.placeholder.com/150'}
                            alt={post.user?.name}
                            className="w-8 h-8 rounded-full border border-bg-border flex-shrink-0 object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                              {post.user?.name}
                              {isMentor && (
                                <span className="text-[9px] uppercase font-black text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                                  Mentor
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                              {post.user?.college} • {dayjs(post.createdAt).fromNow()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => upvoteMutation.mutate(post._id)}
                            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-brand-400 transition-colors bg-bg-hover px-2.5 py-1 rounded border border-bg-border"
                          >
                            <ThumbsUp className="w-3 h-3" /> {post.upvotes || 0}
                          </button>
                        </div>
                      </div>

                      <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60 space-y-3">
              <label className="block text-xs font-semibold text-text-secondary uppercase">
                Post Solution / Question
              </label>
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input w-full min-h-[100px] text-sm pr-12 p-3 bg-bg-primary/30"
                  placeholder="Share code, logic approach, complexity details, or ask a doubt..."
                  required
                />
                <button
                  type="submit"
                  disabled={createPostMutation.isPending || !newComment.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
