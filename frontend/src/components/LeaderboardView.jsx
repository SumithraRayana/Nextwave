import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Users, Award, Shield, ArrowUpRight, Sparkles, RefreshCw, BarChart2, Info, ChevronRight, X, Share2, Copy } from 'lucide-react';
import { fetchCollegeLeaderboard, fetchChampionsLeaderboard, fetchCollegeDetails } from '../api';

export default function LeaderboardView({ onJoinChallengeForCollege }) {
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' | 'champions'
  const [sortBy, setSortBy] = useState('registrations'); // 'registrations' | 'rate'
  const [colleges, setColleges] = useState([]);
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegeDetailsLoading, setCollegeDetailsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadData();
  }, [sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cols, champs] = await Promise.all([
        fetchCollegeLeaderboard(sortBy),
        fetchChampionsLeaderboard(15)
      ]);
      setColleges(cols);
      setChampions(champs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCollege = async (collegeId) => {
    try {
      setCollegeDetailsLoading(true);
      const details = await fetchCollegeDetails(collegeId);
      setSelectedCollege(details);
    } catch (err) {
      console.error(err);
    } finally {
      setCollegeDetailsLoading(false);
    }
  };

  const copyCollegeLink = () => {
    if (!selectedCollege) return;
    const url = `${window.location.origin}/?college=${selectedCollege.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Live Campus Battle
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          National AI Readiness Leaderboard
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300">
          Rankings updated in real-time as final-year students take the AI Readiness Test and register for the free workshop.
        </p>

        {/* Top Tab Toggle: Colleges vs Campus Champions */}
        <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('colleges')}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'colleges'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            College Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('champions')}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'champions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-cyan-300" />
            Top Campus Champions
          </button>
        </div>
      </div>

      {activeTab === 'colleges' && (
        <div>
          {/* Fairness Sub-toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Ranking Metric:</span>
              <div className="inline-flex p-0.5 rounded-lg bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setSortBy('registrations')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    sortBy === 'registrations'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overall Registrations
                </button>
                <button
                  onClick={() => setSortBy('rate')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    sortBy === 'rate'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Most Engaged (% Rate)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                {sortBy === 'rate'
                  ? 'Normalized by eligible student population for fair cross-campus comparison.'
                  : 'Total verified student registrations from each engineering institution.'}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-7 h-7 animate-spin text-cyan-400 mx-auto" />
                <p className="mt-2 text-xs text-slate-400">Updating leaderboard...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-center w-16">Rank</th>
                      <th className="py-3.5 px-4">College Name</th>
                      <th className="py-3.5 px-4 text-center">Location</th>
                      <th className="py-3.5 px-4 text-right">Registered</th>
                      <th className="py-3.5 px-4 text-right">Participation Rate</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">Top Campus Champion</th>
                      <th className="py-3.5 px-4 text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {colleges.map((col) => {
                      const isTop3 = col.rank <= 3;
                      const rankBadge =
                        col.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : col.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : col.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400';

                      return (
                        <tr
                          key={col.id}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => handleOpenCollege(col.id)}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-sm ${rankBadge}`}
                            >
                              {col.rank}
                            </span>
                          </td>

                          {/* College Name */}
                          <td className="py-4 px-4 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            <div className="flex items-center gap-2">
                              <span>{col.name}</span>
                              {col.rank === 1 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                  Leading
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-4 text-center text-xs text-slate-400">
                            {col.city || 'India'}
                          </td>

                          {/* Registrations */}
                          <td className="py-4 px-4 text-right font-black text-white text-base">
                            {col.qualified_students}
                          </td>

                          {/* Participation Rate */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-cyan-400">{col.participation_rate}%</span>
                              <span className="text-[10px] text-slate-400">
                                of ~{col.eligible_students} final-years
                              </span>
                            </div>
                          </td>

                          {/* Top Champion */}
                          <td className="py-4 px-4 text-xs text-slate-300 hidden md:table-cell">
                            {col.top_champion_name !== 'None' ? (
                              <div className="flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-medium text-white">{col.top_champion_name}</span>
                                <span className="text-slate-400">({col.top_champion_referrals} refs)</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No referrers yet</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCollege(col.id);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INDIVIDUAL CHAMPIONS TAB */}
      {activeTab === 'champions' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Top Campus Contributors (National)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Students driving the highest peer participation for their institutions.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Privacy protected: First name only
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 text-right">Classmates Referred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {champions.map((champ) => {
                  const rankBadge =
                    champ.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : champ.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : champ.rank === 3
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={champ.rank} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${rankBadge}`}>
                          {champ.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span>{champ.first_name}</span>
                        {champ.rank === 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            #1 Champion
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 font-medium">
                        {champ.college_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {champ.branch}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-cyan-400 text-base">
                        {champ.referrals_count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLEGE DEDICATED PROFILE MODAL */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedCollege(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold mb-3">
              Campus Profile
            </div>

            <h3 className="text-2xl font-black text-white">{selectedCollege.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{selectedCollege.city}, {selectedCollege.state || 'India'}</p>

            {/* Core Stats */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Rank</span>
                <span className="text-xl font-black text-amber-400">#{selectedCollege.college_rank}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Students</span>
                <span className="text-xl font-black text-white">{selectedCollege.student_count}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Participation</span>
                <span className="text-xl font-black text-cyan-400">{selectedCollege.participation_rate}%</span>
              </div>
            </div>

            {/* Top Student Champion for this College */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Lead Campus Contributor:</span>
              <span className="font-bold text-amber-300">{selectedCollege.top_champion}</span>
            </div>

            {/* Branch Breakdown */}
            {selectedCollege.branches && selectedCollege.branches.length > 0 && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Branch Participation:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCollege.branches.map((b, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <strong>{b.branch}:</strong> {b.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedCollege(null);
                  if (onJoinChallengeForCollege) {
                    onJoinChallengeForCollege(selectedCollege);
                  }
                }}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                Help {selectedCollege.name.split(' ')[0]} Reach #1 (Register Free)
              </button>

              <button
                onClick={copyCollegeLink}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedLink ? 'Copied Campus Link!' : 'Copy College Challenge Link'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
