import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Link,
  Target,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Code,
  Github,
  Globe,
} from 'lucide-react';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' },
  }),
};

export default function OnboardingPage() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: '',
    branch: '',
    year: '1',
    leetcodeUrl: '',
    gfgUrl: '',
    githubUrl: '',
    referralCode: '',
    dailyGoal: '3',
    weeklyGoal: '15',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.college.trim() || !formData.branch.trim()) {
        toast.error('Please fill in all required fields.');
        return;
      }
    }
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await completeProfile({
        name: formData.name,
        college: formData.college,
        branch: formData.branch,
        year: parseInt(formData.year),
        leetcodeUrl: formData.leetcodeUrl,
        gfgUrl: formData.gfgUrl,
        githubUrl: formData.githubUrl,
        referralCode: formData.referralCode,
        dailyGoal: parseInt(formData.dailyGoal),
        weeklyGoal: parseInt(formData.weeklyGoal),
      });
      toast.success('Profile completed successfully! Welcome aboard 🚀');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    return (
      <div className="flex items-center justify-between max-w-xs mx-auto mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                step >= s
                  ? 'border-brand-500 bg-brand-600/10 text-brand-400 shadow-glow-sm'
                  : 'border-bg-border text-text-muted bg-bg-secondary'
              }`}
            >
              {step > s ? <Check className="w-4 h-4 text-brand-400" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 mx-1 transition-all duration-300 ${
                  step > s ? 'bg-brand-500' : 'bg-bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative bg-bg-primary">
      {/* Background Decorative Blur */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl bg-bg-secondary/40 border border-bg-border/60 glass-card p-6 md:p-10 rounded-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
            Set Up Your Profile
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Let us customize your DSA roadmap and tracking experience.
          </p>
        </div>

        {renderProgress()}

        <form onSubmit={handleSubmit} className="overflow-hidden relative min-h-[300px]">
          <AnimatePresence custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Basic & Academic Details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="e.g., IIT Bombay"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                      Branch / Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Current Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="input w-full cursor-pointer"
                  >
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary py-3 px-6 flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
                  <Link className="w-5 h-5" />
                  <span>Coding & Profile Links</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    LeetCode Profile URL
                  </label>
                  <div className="relative">
                    <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="url"
                      name="leetcodeUrl"
                      value={formData.leetcodeUrl}
                      onChange={handleChange}
                      className="input w-full pl-11"
                      placeholder="https://leetcode.com/u/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    GeeksforGeeks Profile URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="url"
                      name="gfgUrl"
                      value={formData.gfgUrl}
                      onChange={handleChange}
                      className="input w-full pl-11"
                      placeholder="https://auth.geeksforgeeks.org/user/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    GitHub Profile URL (Optional)
                  </label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      className="input w-full pl-11"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter referral code if you have one"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-secondary py-3 px-6 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary py-3 px-6 flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
                  <Target className="w-5 h-5" />
                  <span>Goal Setting</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Daily Problem Solving Goal ({formData.dailyGoal} problems)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="dailyGoal"
                    value={formData.dailyGoal}
                    onChange={handleChange}
                    className="w-full accent-brand-500 h-1.5 bg-bg-border rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1.5 font-medium">
                    <span>1 (Easygoing)</span>
                    <span>5 (Balanced)</span>
                    <span>10 (Competitive)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
                    Weekly Problem Solving Goal ({formData.weeklyGoal} problems)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    name="weeklyGoal"
                    value={formData.weeklyGoal}
                    onChange={handleChange}
                    className="w-full accent-brand-500 h-1.5 bg-bg-border rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-text-muted mt-1.5 font-medium">
                    <span>5 problems/wk</span>
                    <span>35 problems/wk</span>
                    <span>70 problems/wk</span>
                  </div>
                </div>

                <div className="bg-brand-500/5 border border-brand-500/10 p-4 rounded-xl text-xs text-text-secondary flex items-start gap-3 mt-4">
                  <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-brand-400 block mb-0.5">Custom Learning Roadmap</span>
                    Based on your selection, we will customize recommendations in your Dashboard. You can modify these targets at any time in Profile settings.
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={loading}
                    className="btn-secondary py-3 px-6 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary py-3 px-8 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Setup <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
