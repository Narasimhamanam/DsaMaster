import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentorService } from '../../services/services';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChevronLeft,
  User,
  Activity,
  MessageSquare,
  StickyNote,
  Flame,
  Star,
  CheckCircle,
  Award,
  Sparkles,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];
const NOTE_COLORS = {
  praise: 'border-l-green-500 bg-green-500/5 text-green-400',
  warning: 'border-l-red-500 bg-red-500/5 text-red-400',
  observation: 'border-l-blue-500 bg-blue-500/5 text-blue-400',
  contacted: 'border-l-purple-500 bg-purple-500/5 text-purple-400',
};

export default function MentorStudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('observation'); // observation, warning, praise, contacted
  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Fetch student details & history
  const { data: studentData, isLoading, error } = useQuery({
    queryKey: ['mentor-student', id],
    queryFn: async () => {
      const { data } = await mentorService.getStudent(id);
      return data; // returns { user, notes, progress, topicProgress }
    },
  });

  // Mutate add note
  const addNoteMutation = useMutation({
    mutationFn: async ({ note, type }) => {
      const { data } = await mentorService.addNote(id, note, type);
      return data;
    },
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries(['mentor-student', id]);
      toast.success('Mentorship note saved successfully! 📝');
    },
    onError: () => {
      toast.error('Failed to add note.');
    },
  });

  // Mutate send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const { data } = await mentorService.sendMessage(id, message);
      return data;
    },
    onSuccess: () => {
      setMessageText('');
      setShowMessageModal(false);
      toast.success('Direct message sent to student dashboard! 💬');
    },
    onError: () => {
      toast.error('Failed to send message.');
    },
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addNoteMutation.mutate({ note: noteContent, type: noteType });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pt-6 animate-pulse">
        <div className="h-6 w-32 bg-bg-card rounded-md" />
        <div className="h-44 bg-bg-card rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !studentData?.user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-text-primary">Student Not Found</h2>
        <p className="text-text-muted mt-2">Could not retrieve details for this student.</p>
        <button onClick={() => navigate('/mentor/students')} className="btn-primary mt-6 px-6 py-2.5">
          Back to Students
        </button>
      </div>
    );
  }

  const { user: student, notes = [], topicProgress = [] } = studentData;

  const difficultyData = [
    { name: 'Easy', value: student.difficultyBreakdown?.easy || 0 },
    { name: 'Medium', value: student.difficultyBreakdown?.medium || 0 },
    { name: 'Hard', value: student.difficultyBreakdown?.hard || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/mentor/students')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Students
      </button>

      {/* Student Profile Card */}
      <div className="glass-card p-6 md:p-8 bg-bg-secondary/40 border-bg-border/60 relative overflow-hidden rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.photoURL || 'https://via.placeholder.com/150'}
              alt={student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-bg-border object-cover"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-display font-bold text-text-primary">
                  {student.name}
                </h1>
                <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/15">
                  LVL {student.level || 1}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {student.college} • {student.branch} • Year {student.year}
              </p>
              <div className="flex gap-4 text-xs text-text-muted mt-2">
                {student.leetcodeUrl && (
                  <a href={student.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 flex items-center gap-1">
                    LeetCode <Star className="w-3 h-3" />
                  </a>
                )}
                {student.githubUrl && (
                  <a href={student.githubUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 flex items-center gap-1">
                    GitHub <Star className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <MessageSquare className="w-4 h-4" /> Message Student
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Total Solved</div>
          <div className="text-xl font-bold text-text-primary mt-1">{student.totalSolved || 0}</div>
        </div>
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Current Streak</div>
          <div className="text-xl font-bold text-orange-400 mt-1 flex items-center gap-1">
            <Flame className="w-4.5 h-4.5" /> {student.currentStreak || 0}
          </div>
        </div>
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">XP Earned</div>
          <div className="text-xl font-bold text-brand-400 mt-1 flex items-center gap-1">
            <Star className="w-4 h-4" /> {student.xp || 0}
          </div>
        </div>
        <div className="glass-card p-4 bg-bg-secondary/40 border-bg-border/60">
          <div className="text-text-muted text-[10px] uppercase font-semibold">Placement Score</div>
          <div className="text-xl font-bold text-brand-300 mt-1">{student.placementScore || 0}%</div>
        </div>
      </div>

      {/* Middle Sections: Progress Grid & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Topic progress grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60">
            <div className="flex items-center gap-2 border-b border-bg-border/40 pb-3 mb-4">
              <Activity className="w-4.5 h-4.5 text-brand-400" />
              <h3 className="font-bold text-text-primary text-sm">DSA Topic Mastery Progress</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topicProgress.map((tp, idx) => {
                const percent = tp.problemCount > 0 ? Math.round((tp.solvedCount / tp.problemCount) * 100) : 0;
                return (
                  <div key={idx} className="bg-bg-primary/20 border border-bg-border/40 p-3.5 rounded-xl">
                    <div className="flex justify-between text-xs font-bold text-text-primary mb-2">
                      <span className="truncate">{tp.name}</span>
                      <span className="text-[10px] text-text-muted">{tp.solvedCount}/{tp.problemCount}</span>
                    </div>
                    <div className="w-full bg-bg-hover h-2 rounded-full overflow-hidden border border-bg-border/50">
                      <div className="bg-gradient-brand h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Difficulty breakdown & heatmaps */}
        <div className="space-y-6">
          <div className="glass-card p-5 bg-bg-secondary/40 border-bg-border/60 flex flex-col items-center">
            <h3 className="font-bold text-text-primary text-sm mb-4 w-full">Accuracy Breakdown</h3>
            {difficultyData.length === 0 ? (
              <div className="text-text-muted text-xs py-8">No solved problems data.</div>
            ) : (
              <div className="h-44 w-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex gap-4 text-xs font-semibold mt-2">
              <span className="text-green-400">Easy ({student.difficultyBreakdown?.easy || 0})</span>
              <span className="text-yellow-400">Med ({student.difficultyBreakdown?.medium || 0})</span>
              <span className="text-red-400">Hard ({student.difficultyBreakdown?.hard || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mentorship Notes History Section */}
      <div className="glass-card p-6 bg-bg-secondary/40 border-bg-border/60 space-y-6">
        <h3 className="font-bold text-text-primary text-sm flex items-center gap-2 border-b border-bg-border/40 pb-3">
          <StickyNote className="w-4.5 h-4.5 text-brand-400" /> Mentorship Notes & Log
        </h3>

        {/* Form to submit note */}
        <form onSubmit={handleAddNote} className="space-y-4 bg-bg-primary/20 p-4 rounded-xl border border-bg-border/40">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <label className="text-xs font-semibold text-text-secondary uppercase">
              Add Observation / Incident
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Type:</span>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="bg-bg-hover text-xs border border-bg-border text-text-secondary rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="observation">Observation</option>
                <option value="praise">Praise</option>
                <option value="warning">Warning Alert</option>
                <option value="contacted">Contacted</option>
              </select>
            </div>
          </div>

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="input w-full min-h-[90px] text-xs p-3"
            placeholder="Type observations, call updates, or warnings for this student..."
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addNoteMutation.isPending}
              className="btn-primary px-5 py-2 text-xs font-bold"
            >
              {addNoteMutation.isPending ? 'Saving...' : 'Save Log Entry'}
            </button>
          </div>
        </form>

        {/* Notes list */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-6 text-text-muted text-xs">
              No mentorship logs recorded for this student yet.
            </div>
          ) : (
            notes.map((note) => {
              const borderStyle = NOTE_COLORS[note.type] || NOTE_COLORS.observation;
              return (
                <div key={note._id} className={`p-4 rounded-xl border border-bg-border/60 border-l-4 ${borderStyle} text-xs space-y-2`}>
                  <div className="flex justify-between items-center text-[10px] text-text-muted">
                    <span className="font-extrabold uppercase tracking-wider">{note.type}</span>
                    <span>{dayjs(note.createdAt).format('D MMM YYYY, h:mm A')}</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed font-medium">
                    {note.note}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Direct Alert Message Dialog */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSendMessage}
            className="w-full max-w-md bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4"
          >
            <div>
              <h3 className="font-bold text-text-primary text-base">Message {student.name}</h3>
              <p className="text-text-muted text-xs mt-1">Send a direct message alert that will push on their dashboard.</p>
            </div>

            <textarea
              className="input w-full min-h-[100px] text-xs p-3"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type message here..."
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="btn-primary px-5 py-2 text-xs font-bold"
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
