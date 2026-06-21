import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Trophy,
  Zap,
  BookOpen,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Complete NeetCode Path',
    desc: 'Structured learning across 18 core topics, from Arrays to Advanced DP.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Flame,
    title: 'Gamified Progress & Streaks',
    desc: 'Keep your coding streak active, earn XP, level up, and unlock rare badges.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Trophy,
    title: 'Weekly Contests',
    desc: 'Participate in live battles, compare standings, and boost placement readiness.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Zap,
    title: 'Spaced Repetition Revision',
    desc: 'Smart revision scheduler ensures you never forget solved problems.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await loginWithGoogle();
      toast.success('Signed in successfully!');
      if (res?.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden relative bg-bg-primary">
      {/* Background Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[600px] z-10">
        {/* Left Side: Features Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-card p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-bg-secondary/60"
        >
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-display font-extrabold tracking-tight text-text-primary">
                DSA<span className="gradient-text">MASTER</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-4">
              The Ultimate Platform to <span className="gradient-text">Master DSA</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base mb-10 max-w-md">
              Step into a complete ecosystem designed for placement readiness, gamified tracking, and competitive coding.
            </p>

            <div className="space-y-6">
              {FEATURES.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    className="flex gap-4 items-start"
                  >
                    <div className={`p-2.5 rounded-xl ${feat.bg} ${feat.color} border border-white/5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm md:text-base">
                        {feat.title}
                      </h3>
                      <p className="text-text-muted text-xs md:text-sm mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-text-muted border-t border-bg-border/60 pt-6">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Secure Authentication powered by Firebase
          </div>
        </motion.div>

        {/* Right Side: Login Panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass-card p-8 md:p-12 flex flex-col justify-center items-center bg-bg-secondary/60 relative"
        >
          <div className="w-full max-w-sm text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-text-primary">
                Welcome to DSAMASTER
              </h2>
              <p className="text-text-muted text-sm mt-2">
                Join thousands of students cracking top product companies.
              </p>
            </div>

            <div className="glass-card p-6 md:p-8 bg-bg-card/40 border-bg-border/60 shadow-lg">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-98 transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.618 4.47 1.637l2.427-2.427C17.26 1.704 14.86 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.627-.086-1.286-.22-1.955H12.24z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </>
                )}
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-bg-border/50" />
                </div>
                <div className="relative text-xs uppercase bg-bg-card/80 px-2 text-text-muted inline-block z-10">
                  Secure Access
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                By logging in, you agree to our Terms of Service and Privacy Policy. We only access your name, email, and profile photo.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
              <a href="/" className="text-text-muted hover:text-brand-400 transition-colors flex items-center gap-1">
                Back to Home <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
