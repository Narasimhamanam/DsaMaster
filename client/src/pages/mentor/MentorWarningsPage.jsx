import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentorService } from '../../services/services';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronRight, MessageSquare, ShieldAlert, Sparkles, RefreshCw, X, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function MentorWarningsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');

  // Fetch inactive students list (auto refreshes every 5 mins)
  const { data: warningsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['mentor-inactive'],
    queryFn: async () => {
      const { data } = await mentorService.getInactive();
      return data || { level1: [], level2: [], level3: [] };
    },
    refetchInterval: 300000, // 5 minutes in milliseconds
  });

  // Mutation to send a reminder
  const sendReminderMutation = useMutation({
    mutationFn: async ({ studentId, message }) => {
      const { data } = await mentorService.sendMessage(studentId, message);
      return data;
    },
    onSuccess: () => {
      setSelectedStudent(null);
      setReminderMessage('');
      toast.success('Reminder notification dispatched to mentee! ⚡');
    },
    onError: () => {
      toast.error('Failed to send reminder.');
    },
  });

  const handleOpenReminder = (student) => {
    setSelectedStudent(student);
    setReminderMessage(`Hey ${student.name}, noticed you've been inactive for a few days. Let's get back to solving problems on your DSA Roadmap! Let me know if you need help.`);
  };

  const handleSendReminder = (e) => {
    e.preventDefault();
    if (!selectedStudent || !reminderMessage.trim()) return;
    sendReminderMutation.mutate({
      studentId: selectedStudent._id || selectedStudent.uid,
      message: reminderMessage,
    });
  };

  const level1 = warningsData?.level1 || [];
  const level2 = warningsData?.level2 || [];
  const level3 = warningsData?.level3 || [];

  const StudentCard = ({ student, levelStyle }) => {
    const lastActiveStr = student.lastSolvedDate
      ? dayjs(student.lastSolvedDate).fromNow()
      : 'Never';
    return (
      <div className="bg-bg-secondary/40 border border-bg-border/60 p-4 rounded-xl flex flex-col justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={student.photoURL || 'https://via.placeholder.com/150'}
            alt={student.name}
            className="w-10 h-10 rounded-full border border-bg-border object-cover"
          />
          <div className="min-w-0">
            <span className="font-bold text-text-primary text-xs sm:text-sm truncate block">
              {student.name}
            </span>
            <span className="text-[10px] text-text-muted truncate block">
              {student.college}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-text-secondary bg-bg-primary/20 p-2 rounded-lg">
          <div>
            <span className="text-text-muted block text-[9px] uppercase">Solved</span>
            <span className="text-text-primary mt-0.5 inline-block font-bold">{student.totalSolved || 0}</span>
          </div>
          <div>
            <span className="text-text-muted block text-[9px] uppercase">Streak</span>
            <span className="text-orange-400 mt-0.5 inline-block font-bold">{student.currentStreak || 0}</span>
          </div>
          <div>
            <span className="text-text-muted block text-[9px] uppercase">Readiness</span>
            <span className="text-brand-400 mt-0.5 inline-block font-bold">{student.placementScore || 0}%</span>
          </div>
        </div>

        <div className="text-[10px] font-medium text-text-muted flex justify-between items-center border-t border-bg-border/30 pt-2.5">
          <span>Last solved: {lastActiveStr}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleOpenReminder(student)}
              className="bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/20 text-brand-400 p-1.5 rounded-lg transition-all"
              title="Send Alert Message"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate(`/mentor/students/${student._id}`)}
              className="bg-bg-hover hover:text-text-primary border border-bg-border p-1.5 rounded-lg transition-all"
              title="Inspect Profile"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-orange-400" /> Inactivity Warning Hub
          </h1>
          <p className="text-text-secondary text-sm">
            Identify dropout threats, track streak drops, and send direct dashboard nudge alerts.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-bg-hover hover:bg-bg-hover/80 border border-bg-border text-text-secondary transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse pt-4">
          <div className="h-64 bg-bg-card rounded-2xl" />
          <div className="h-64 bg-bg-card rounded-2xl" />
          <div className="h-64 bg-bg-card rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Level 1 column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-orange-500/25 pb-2.5">
              <span className="text-xs uppercase font-extrabold text-orange-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Level 1 (3+ Days Inactive)
              </span>
              <span className="text-xs font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/25">
                {level1.length}
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {level1.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs bg-bg-secondary/15 rounded-xl border border-bg-border/30">
                  No students in Level 1.
                </div>
              ) : (
                level1.map((warning, idx) => (
                  <StudentCard key={idx} student={warning.user || warning} levelStyle="orange" />
                ))
              )}
            </div>
          </div>

          {/* Level 2 column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-orange-600/25 pb-2.5">
              <span className="text-xs uppercase font-extrabold text-orange-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Level 2 (7+ Days Inactive)
              </span>
              <span className="text-xs font-bold bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded border border-orange-500/25">
                {level2.length}
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {level2.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs bg-bg-secondary/15 rounded-xl border border-bg-border/30">
                  No students in Level 2.
                </div>
              ) : (
                level2.map((warning, idx) => (
                  <StudentCard key={idx} student={warning.user || warning} levelStyle="orange" />
                ))
              )}
            </div>
          </div>

          {/* Level 3 column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-red-500/25 pb-2.5">
              <span className="text-xs uppercase font-extrabold text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Level 3 (Critical - 14+ Days)
              </span>
              <span className="text-xs font-bold bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/25">
                {level3.length}
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {level3.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-xs bg-bg-secondary/15 rounded-xl border border-bg-border/30">
                  No students in Level 3.
                </div>
              ) : (
                level3.map((warning, idx) => (
                  <StudentCard key={idx} student={warning.user || warning} levelStyle="red" />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder Message Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSendReminder}
            className="w-full max-w-md bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4"
          >
            <div>
              <h3 className="font-bold text-text-primary text-base">Nudge {selectedStudent.name}</h3>
              <p className="text-text-muted text-xs mt-1">Write a reminder that will be shown in their notifications panel.</p>
            </div>

            <textarea
              className="input w-full min-h-[100px] text-xs p-3"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendReminderMutation.isPending}
                className="btn-primary px-5 py-2 text-xs font-bold"
              >
                {sendReminderMutation.isPending ? 'Sending...' : 'Send Alert Nudge'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
