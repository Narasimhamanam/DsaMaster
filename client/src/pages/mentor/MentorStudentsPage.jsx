import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mentorService } from '../../services/services';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import dayjs from 'dayjs';

export default function MentorStudentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Fetch students based on filters
  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ['mentor-students', page, search, collegeFilter, branchFilter, yearFilter],
    queryFn: async () => {
      const { data } = await mentorService.getStudents({
        page,
        search,
        college: collegeFilter,
        branch: branchFilter,
        year: yearFilter,
        limit: 10,
      });
      return data || { students: [], total: 0, pages: 1 };
    },
  });

  const students = responseData?.students || [];
  const totalPages = responseData?.pages || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
          Mentee Cohort
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Review, inspect, and analyze all students assigned under your profile.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by Name or Email..."
            className="input w-full pl-10 text-xs py-2"
          />
        </div>

        <select
          value={collegeFilter}
          onChange={handleFilterChange(setCollegeFilter)}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Colleges</option>
          <option value="iit">IITs</option>
          <option value="nit">NITs</option>
          <option value="bits">BITS Pilani</option>
          {/* Dynamically, this would load from a unique list, but static list of categories serves well */}
        </select>

        <select
          value={branchFilter}
          onChange={handleFilterChange(setBranchFilter)}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Branches</option>
          <option value="computer">Computer Science</option>
          <option value="information">Information Technology</option>
          <option value="electronics">Electronics / ECE</option>
        </select>

        <select
          value={yearFilter}
          onChange={handleFilterChange(setYearFilter)}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Years</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-bg-border/60 text-xs font-semibold text-text-muted bg-bg-secondary/20">
                  <th className="p-4">Student</th>
                  <th className="p-4">College details</th>
                  <th className="p-4 text-center">Solved</th>
                  <th className="p-4 text-center">Streak</th>
                  <th className="p-4 text-center">Level</th>
                  <th className="p-4">Readiness</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-text-muted text-sm font-medium">
                      No cohort students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const lastActiveStr = student.lastSolvedDate
                      ? dayjs(student.lastSolvedDate).fromNow()
                      : 'Never';
                    return (
                      <tr key={student._id || student.uid} className="border-b border-bg-border/30 hover:bg-bg-hover/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.photoURL || 'https://via.placeholder.com/150'}
                              alt={student.name}
                              className="w-8 h-8 rounded-full border border-bg-border flex-shrink-0 object-cover"
                            />
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-text-primary block truncate">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-text-muted truncate mt-0.5 block">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="text-xs font-semibold text-text-primary">
                            {student.college}
                          </div>
                          <div className="text-[10px] text-text-muted mt-0.5">
                            {student.branch} • Year {student.year}
                          </div>
                        </td>

                        <td className="p-4 text-center font-bold text-text-secondary text-sm">
                          {student.totalSolved || 0}
                        </td>

                        <td className="p-4 text-center font-bold text-orange-400 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <Flame className="w-4 h-4" /> {student.currentStreak || 0}
                          </span>
                        </td>

                        <td className="p-4 text-center font-bold text-brand-400 text-xs">
                          LVL {student.level || 1}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-bg-hover h-2 rounded-full overflow-hidden border border-bg-border/50">
                              <div
                                className="bg-gradient-brand h-full rounded-full"
                                style={{ width: `${student.placementScore || 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-brand-300">
                              {student.placementScore || 0}%
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-xs text-text-secondary font-semibold">
                          {lastActiveStr}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => navigate(`/mentor/students/${student._id}`)}
                            className="bg-bg-hover hover:bg-brand-500/10 border border-bg-border hover:border-brand-500/25 p-1.5 rounded-lg text-text-secondary hover:text-brand-400 transition-all inline-flex items-center justify-center"
                            title="Inspect Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-bg-border/30 bg-bg-secondary/20 flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Showing Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-bg-hover border border-bg-border px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-bg-hover border border-bg-border px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
