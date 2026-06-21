import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  BookOpen,
  Trophy,
  Users,
  BarChart3,
  RefreshCw,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Code2,
  Target,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Data ───────────────────────────────────────────────────── */
const STATS = [
  { value: '150+',   label: 'NeetCode Problems', icon: Code2   },
  { value: '18',     label: 'DSA Topics',         icon: BookOpen },
  { value: 'Weekly', label: 'Contests',            icon: Trophy   },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    desc: 'Follow a curated NeetCode-style roadmap across 18 core DSA topics — from Arrays to DP — with guided problem sets and difficulty progression.',
    color: 'from-violet-500/20 to-purple-600/10',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
  },
  {
    icon: Trophy,
    title: 'Live Contests',
    desc: 'Participate in weekly timed contests against your peers. Climb the leaderboard and earn contest badges that signal interview-readiness.',
    color: 'from-amber-500/20 to-yellow-600/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    icon: Users,
    title: 'Mentorship',
    desc: 'Get assigned a dedicated mentor who tracks your progress, sends motivational nudges, and guides your preparation toward your target companies.',
    color: 'from-sky-500/20 to-blue-600/10',
    border: 'border-sky-500/20',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Visualise your solving heatmap, topic-wise strength radar, contest performance trends, and daily streak — all in one powerful dashboard.',
    color: 'from-emerald-500/20 to-green-600/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    icon: RefreshCw,
    title: 'Revision System',
    desc: 'Spaced-repetition powered smart review queue ensures you never forget what you have solved. Re-attempt problems at optimal intervals.',
    color: 'from-pink-500/20 to-rose-600/10',
    border: 'border-pink-500/20',
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-400',
  },
  {
    icon: Star,
    title: 'Achievements',
    desc: 'Unlock badges for streaks, speed-solves, topic mastery, and contest wins. Showcase your profile to recruiters and peers alike.',
    color: 'from-orange-500/20 to-amber-600/10',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
];

const TESTIMONIALS = [
  {
    quote: "DSAMASTER's structured roadmap helped me crack my Atlassian interview in 6 weeks flat. The mentor accountability was a game-changer.",
    name: 'Priya Sharma',
    role: 'SDE-2 @ Atlassian',
    avatar: 'PS',
    bg: 'bg-violet-500',
  },
  {
    quote: 'The weekly contests kept me sharp and competitive. I went from rank 200 to rank 8 in a month — this platform is addictive in the best way.',
    name: 'Arjun Mehta',
    role: 'SDE-1 @ Flipkart',
    avatar: 'AM',
    bg: 'bg-sky-500',
  },
  {
    quote: 'The spaced-repetition revision system is genius. I stopped blanking on problems I had solved before. My retention went through the roof.',
    name: 'Sneha Rao',
    role: 'Backend Engineer @ Razorpay',
    avatar: 'SR',
    bg: 'bg-emerald-500',
  },
];

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues',
  'Binary Search', 'Sliding Window', 'Two Pointers', 'Trees',
  'Graphs', 'Heaps', 'Backtracking', 'Dynamic Programming',
  'Greedy', 'Tries', 'Intervals', 'Bit Manipulation',
  'Math & Numbers', 'System Design',
];

/* ─── Floating orb ───────────────────────────────────────────── */
const Orb = ({ className, size, delay = 0, duration = 8 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={{ width: size, height: size }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      x: [0, 30, 0],
      y: [0, -20, 0],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

/* ─── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ onGetStarted }) => (
  <motion.nav
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-16 py-4"
    style={{
      background: 'linear-gradient(to bottom, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0) 100%)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
        <Code2 className="w-4 h-4 text-white" />
      </div>
      <span className="font-display font-bold text-lg text-text-primary tracking-tight">
        DSA<span className="gradient-text">MASTER</span>
      </span>
    </div>

    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
      {['Features', 'Topics', 'Testimonials'].map((l) => (
        <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-text-primary transition-colors duration-200">
          {l}
        </a>
      ))}
    </div>

    <button onClick={onGetStarted} className="btn-primary text-sm px-4 py-2">
      Get Started <ArrowRight className="w-3.5 h-3.5" />
    </button>
  </motion.nav>
);

/* ─── Hero ───────────────────────────────────────────────────── */
const Hero = ({ onGetStarted }) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
      <Orb className="bg-brand-600/40 -top-20 -left-20"  size={600} delay={0} duration={10} />
      <Orb className="bg-purple-700/30 top-1/3 -right-32" size={500} delay={2} duration={12} />
      <Orb className="bg-brand-800/20 bottom-0 left-1/3"  size={400} delay={1} duration={9}  />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div style={{ y: heroY }} className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold mb-8 backdrop-blur-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          India's #1 DSA Preparation Platform — 2026
        </motion.div>

        <div className="mb-6 space-y-1">
          {['Master DSA.', 'Get Placed.', 'Dominate Competitions.'].map((word, i) => (
            <motion.h1
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="block text-5xl md:text-7xl font-display font-extrabold leading-tight tracking-tight"
            >
              {i === 1 ? (
                <span className="gradient-text">{word}</span>
              ) : (
                <span className="text-text-primary">{word}</span>
              )}
            </motion.h1>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A structured, mentor-driven DSA platform — curated problems, live contests,
          spaced-repetition revision, and deep analytics to get you placement-ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button onClick={onGetStarted} className="btn-primary px-8 py-3.5 text-base rounded-2xl shadow-glow">
            Get Started with Google
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#features" className="btn-secondary px-8 py-3.5 text-base rounded-2xl">
            Explore Features
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="glass-card p-4 flex flex-col items-center gap-1 hover:border-brand-600/40 transition-all duration-300 group"
            >
              <Icon className="w-5 h-5 text-brand-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-display font-bold gradient-text">{value}</span>
              <span className="text-text-muted text-xs text-center leading-tight">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </section>
  );
};

/* ─── Features ───────────────────────────────────────────────── */
const Features = () => (
  <section id="features" className="relative py-28 px-6 md:px-16">
    <div className="max-w-7xl mx-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold mb-4">
          <Zap className="w-3 h-3" /> Everything You Need
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
          Built for <span className="gradient-text">placement success</span>
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto text-lg">
          Every feature is purpose-built to take you from beginner to placement-ready in the most efficient way possible.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            custom={i}
            className={`glass-card-hover p-6 rounded-2xl bg-gradient-to-br ${f.color} border ${f.border} group cursor-default`}
          >
            <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <f.icon className={`w-5 h-5 ${f.iconColor}`} />
            </div>
            <h3 className="text-text-primary font-display font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Topics ─────────────────────────────────────────────────── */
const Topics = () => (
  <section id="topics" className="relative py-24 px-6 md:px-16 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/5 via-brand-800/10 to-brand-900/5 pointer-events-none" />
    <div className="max-w-7xl mx-auto relative z-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="text-center mb-14"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold mb-4">
          <Target className="w-3 h-3" /> 18 Core Topics
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
          Complete DSA <span className="gradient-text">Coverage</span>
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto">
          Every topic that appears in FAANG and top-tier product company interviews, structured from fundamentals to advanced.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {TOPICS.map((topic, i) => (
          <motion.span
            key={topic}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="px-4 py-2 glass-card text-text-secondary text-sm font-medium rounded-full border border-bg-border hover:border-brand-600/40 hover:text-brand-400 hover:bg-brand-600/5 transition-all duration-200 cursor-default"
          >
            {topic}
          </motion.span>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        custom={1}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Problems', value: '150+', sub: 'NeetCode curated' },
          { label: 'Topics',   value: '18',   sub: 'Core DSA areas'  },
          { label: 'Contests', value: '52+',  sub: 'Per year'         },
          { label: 'Students', value: '2k+',  sub: 'Already learning' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="glass-card p-6 text-center rounded-2xl hover:border-brand-600/30 transition-all duration-300">
            <div className="text-3xl font-display font-extrabold gradient-text mb-1">{value}</div>
            <div className="text-text-primary font-semibold text-sm">{label}</div>
            <div className="text-text-muted text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

/* ─── How It Works ───────────────────────────────────────────── */
const HowItWorks = () => {
  const steps = [
    { step: '01', title: 'Sign in with Google',  desc: 'One-click signup — link your LeetCode and GFG profiles, set your daily goal, and pick your target companies.' },
    { step: '02', title: 'Follow the Roadmap',   desc: 'Work through 18 DSA topics in a structured sequence. Easy to Medium to Hard, with curated problem sets at every stage.' },
    { step: '03', title: 'Compete & Revise',     desc: 'Join weekly contests, review spaced-repetition flashbacks, and earn achievements as you climb the leaderboard.' },
    { step: '04', title: 'Get Placed',           desc: 'Walk into interviews with confidence backed by data, a solved profile, and a mentor who helped you every step of the way.' },
  ];

  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold mb-4">
            <CheckCircle2 className="w-3 h-3" /> How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
            From zero to <span className="gradient-text">offer letter</span>
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            A proven 4-step process refined by hundreds of successful placements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i}
              className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-brand-600/30 transition-all duration-300"
            >
              <div className="absolute -top-4 -right-2 text-8xl font-display font-black text-brand-600/5 pointer-events-none select-none group-hover:text-brand-600/10 transition-all duration-500">
                {step}
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-600/20 flex items-center justify-center mb-4">
                <span className="text-brand-400 font-display font-bold text-sm">{step}</span>
              </div>
              <h3 className="text-text-primary font-display font-bold text-base mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Testimonials ───────────────────────────────────────────── */
const Testimonials = () => (
  <section id="testimonials" className="py-24 px-6 md:px-16">
    <div className="max-w-7xl mx-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-600/30 bg-brand-600/10 text-brand-400 text-xs font-semibold mb-4">
          <Star className="w-3 h-3 fill-current" /> Student Stories
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
          Trusted by <span className="gradient-text">top achievers</span>
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto">
          Hear from students who used DSAMASTER to land their dream roles at top companies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ quote, name, role, avatar, bg }, i) => (
          <motion.div
            key={name}
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            custom={i}
            className="glass-card p-6 rounded-2xl hover:border-brand-600/20 transition-all duration-300 flex flex-col"
          >
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">"{quote}"</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold`}>
                {avatar}
              </div>
              <div>
                <div className="text-text-primary font-semibold text-sm">{name}</div>
                <div className="text-text-muted text-xs">{role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA Banner ─────────────────────────────────────────────── */
const CTABanner = ({ onGetStarted }) => (
  <section className="py-24 px-6 md:px-16">
    <div className="max-w-4xl mx-auto">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative glass-card rounded-3xl p-10 md:p-16 text-center overflow-hidden border-brand-600/20"
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Your placement journey<br />
            <span className="gradient-text">starts today.</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
            Join thousands of students who are solving smarter, learning faster, and landing offers.
          </p>
          <button onClick={onGetStarted} className="btn-primary px-10 py-4 text-base rounded-2xl shadow-glow">
            Get Started with Google — It's Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-text-muted text-xs mt-4">No credit card required · Join in 30 seconds</p>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─── Footer ─────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="border-t border-bg-border py-12 px-6 md:px-16">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-base text-text-primary tracking-tight">
            DSA<span className="gradient-text">MASTER</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-text-muted">
          <a href="#features" className="hover:text-text-secondary transition-colors">Features</a>
          <a href="#topics" className="hover:text-text-secondary transition-colors">Topics</a>
          <a href="#testimonials" className="hover:text-text-secondary transition-colors">Testimonials</a>
          <span>·</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>

        <div className="flex items-center gap-3">
          {[Github, Twitter, Linkedin].map((Icon, i) => (
            <button
              key={i}
              className="w-8 h-8 rounded-lg border border-bg-border bg-bg-card hover:border-brand-600/40 hover:bg-brand-600/10 flex items-center justify-center transition-all duration-200 text-text-muted hover:text-brand-400"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-bg-border text-center text-text-muted text-xs">
        © {new Date().getFullYear()} DSAMASTER. Built with care for placement warriors everywhere.
      </div>
    </div>
  </footer>
);

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const handleGetStarted = () => navigate('/login');

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onGetStarted={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <Features />
      <Topics />
      <HowItWorks />
      <Testimonials />
      <CTABanner onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
