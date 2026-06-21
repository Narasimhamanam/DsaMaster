import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './components/shared/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import TopicPage from './pages/TopicPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ContestsPage from './pages/ContestsPage';
import ContestRoomPage from './pages/ContestRoomPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import RevisionsPage from './pages/RevisionsPage';
import FeedPage from './pages/FeedPage';
import CompanyTracksPage from './pages/CompanyTracksPage';
import MentorDashboardPage from './pages/mentor/MentorDashboardPage';
import MentorStudentsPage from './pages/mentor/MentorStudentsPage';
import MentorWarningsPage from './pages/mentor/MentorWarningsPage';
import MentorStudentDetailPage from './pages/mentor/MentorStudentDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminProblemsPage from './pages/admin/AdminProblemsPage';
import AdminContestsPage from './pages/admin/AdminContestsPage';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route element={
        <ProtectedRoute roles={['student', 'mentor', 'admin']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/roadmap/:topicId" element={<TopicPage />} />
        <Route path="/problem/:id" element={<ProblemDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/contests/:id" element={<ContestRoomPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/revisions" element={<RevisionsPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/company-tracks" element={<CompanyTracksPage />} />
      </Route>

      {/* Mentor routes */}
      <Route element={
        <ProtectedRoute roles={['mentor', 'admin']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/mentor" element={<MentorDashboardPage />} />
        <Route path="/mentor/students" element={<MentorStudentsPage />} />
        <Route path="/mentor/students/:id" element={<MentorStudentDetailPage />} />
        <Route path="/mentor/warnings" element={<MentorWarningsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/problems" element={<AdminProblemsPage />} />
        <Route path="/admin/contests" element={<AdminContestsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
