import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Trophy, TrendingUp, AlertTriangle, ShieldCheck,
  Search, Filter, Download, RefreshCw, Plus, Edit2, CheckCircle2, Lock,
  Share2, Compass, Layers, FlaskConical, Target, Check
} from 'lucide-react';
import {
  adminLogin, fetchAdminMetrics, fetchAdminRegistrations,
  toggleSuspiciousRegistration, fetchColleges, addCollege,
  updateCollege, fetchExperiments, createExperiment, resetDemoData
} from '../api';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview' | 'funnel' | 'registrations' | 'colleges' | 'experiments'
  const [metrics, setMetrics] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regTotal, setRegTotal] = useState(0);
  const [colleges, setColleges] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Filters for registrations
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSuspicious, setFilterSuspicious] = useState('');

  // College Add / Edit Modal state
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColCity, setNewColCity] = useState('');
  const [newColEligible, setNewColEligible] = useState(1000);
  const [editingCollege, setEditingCollege] = useState(null);

  // New Experiment Modal state
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExpData, setNewExpData] = useState({
    name: '',
    hypothesis: '',
    variant_a: '',
    variant_b: '',
    metric: '',
    status: 'active'
  });

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('nxt_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated, activeAdminTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      setLoading(true);
      const res = await adminLogin(username, password);
      if (res.authenticated) {
        setIsAuthenticated(true);
        localStorage.setItem('nxt_admin_token', res.token);
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed. Try admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nxt_admin_token');
    setIsAuthenticated(false);
  };

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [m, c, e] = await Promise.all([
        fetchAdminMetrics(),
        fetchColleges(),
        fetchExperiments()
      ]);
      setMetrics(m);
      setColleges(c);
      setExperiments(e);

      if (activeAdminTab === 'registrations') {
        await loadRegistrations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const res = await fetchAdminRegistrations({
        search,
        college_id: filterCollege,
        branch: filterBranch,
        year: filterYear,
        is_suspicious: filterSuspicious
      });
      setRegistrations(res.items);
      setRegTotal(res.total);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspicious = async (userId) => {
    try {
      await toggleSuspiciousRegistration(userId);
      await loadRegistrations();
      const m = await fetchAdminMetrics();
      setMetrics(m);
      showFlashMessage('Updated registration validation status');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      await addCollege({
        name: newColName,
        city: newColCity,
        eligible_students: parseInt(newColEligible)
      });
      setShowAddCollege(false);
      setNewColName('');
      setNewColCity('');
      setNewColEligible(1000);
      showFlashMessage('College added successfully!');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCollegeEdit = async (collegeId) => {
    try {
      await updateCollege(collegeId, {
        eligible_students: parseInt(editingCollege.eligible_students)
      });
      setEditingCollege(null);
      showFlashMessage('College updated successfully!');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateExperiment = async (e) => {
    e.preventDefault();
    try {
      await createExperiment(newExpData);
      setShowAddExp(false);
      setNewExpData({
        name: '',
        hypothesis: '',
        variant_a: '',
        variant_b: '',
        metric: '',
        status: 'active'
      });
      showFlashMessage('Experiment logged successfully!');
      loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset demo data? This will re-seed 12 realistic colleges and ~148 sample students.')) return;
    try {
      setLoading(true);
      await resetDemoData();
      showFlashMessage('Demo data reset to fresh baseline.');
      await loadAllAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showFlashMessage = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const exportCSV = () => {
    if (!registrations || registrations.length === 0) return;
    const headers = ["ID", "Name", "Email", "College", "Branch", "Year", "AI Readiness", "Referral Code", "Referred By", "Referrals Generated", "Suspicious", "Registered At"];
    const rows = registrations.map(r => [
      r.id,
      `"${r.name}"`,
      r.email,
      `"${r.college_name}"`,
      r.branch,
      `"${r.year}"`,
      r.ai_readiness_score,
      r.referral_code,
      r.referred_by || "None",
      r.referrals_generated,
      r.is_suspicious ? "Yes" : "No",
      r.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nxtwave_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------- LOGIN VIEW -----------------
  if (!isAuthenticated) {
    return (
      <div className="py-20 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">NxtWave Growth Portal</h2>
          <p className="text-xs text-slate-400 text-center mt-1">Admin access for AI Ready Campus Challenge</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username / Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              Demo Credentials: <span className="font-mono text-cyan-300">admin</span> / <span className="font-mono text-cyan-300">admin123</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In to Growth Engine'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------- DASHBOARD VIEW -----------------
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Campaign Command Center</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
              GROWTH SPRINT v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Budget: ₹2,000 • Target: 500 Registrations • Inter-College Viral Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionMsg && (
            <span className="text-xs font-semibold text-emerald-400 animate-pulse bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              {actionMsg}
            </span>
          )}

          <button
            onClick={handleResetData}
            title="Reset to fresh demo dataset"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Reset Demo Data
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 my-6">
        {[
          { id: 'overview', label: 'Campaign Overview & KPIs', icon: BarChart3 },
          { id: 'funnel', label: 'Funnel & Growth Loop', icon: TrendingUp },
          { id: 'registrations', label: `Student CRM (${regTotal || metrics?.total_registrations || 0})`, icon: Users },
          { id: 'colleges', label: `Colleges (${colleges.length})`, icon: Trophy },
          { id: 'experiments', label: `A/B Experiments (${experiments.length})`, icon: FlaskConical },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeAdminTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ----------------- TAB 1: OVERVIEW ----------------- */}
      {activeAdminTab === 'overview' && metrics && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Target Progress Card */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  7-Day Registration Objective
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white">{metrics.total_registrations}</span>
                  <span className="text-sm text-slate-400">/ 500 Target</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold ml-2">
                    {metrics.progress_percentage}% Reached
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Estimated Cost Per Registration</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(2000 / Math.max(1, metrics.total_registrations)).toFixed(1)} / lead
                </span>
                <span className="text-[10px] text-slate-500 block">Total Budget: ₹2,000</span>
              </div>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, metrics.progress_percentage)}%` }}
              />
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Colleges Competing</span>
              <p className="text-2xl font-black text-white mt-1">{metrics.colleges_participating}</p>
              <span className="text-[11px] text-cyan-400 mt-1 block">Active across India</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Referral Signups</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{metrics.total_referral_signups}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Driven peer-to-peer</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Viral Coefficient (K)</span>
              <p className="text-2xl font-black text-indigo-300 mt-1">{metrics.viral_coefficient}</p>
              <span className="text-[11px] text-indigo-400 mt-1 block">Referrals / Student</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Avg AI Readiness</span>
              <p className="text-2xl font-black text-amber-300 mt-1">{metrics.avg_readiness_score}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Out of 100</span>
            </div>
          </div>

          {/* Two Columns: Branch Distribution & AI Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Branch Distribution (Proof that AI is not just for CSE!) */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Branch Engagement Breakdown</h3>
                  <p className="text-xs text-slate-400">Proves non-CSE student participation in AI</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Universal Scope
                </span>
              </div>

              <div className="space-y-3">
                {metrics.branch_distribution.map((b) => (
                  <div key={b.branch}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">{b.branch}</span>
                      <span className="text-slate-400">{b.count} students ({b.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${b.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Tier Distribution */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">AI Readiness Score Tiers</h3>
                  <p className="text-xs text-slate-400">Student self-assessment distribution</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  4 Tiers
                </span>
              </div>

              <div className="space-y-3">
                {metrics.score_distribution.map((st) => (
                  <div key={st.tier}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">
                        {st.tier} <span className="text-slate-500">({st.range_label})</span>
                      </span>
                      <span className="text-slate-400">{st.count} students ({st.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${st.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- TAB 2: FUNNEL ----------------- */}
      {activeAdminTab === 'funnel' && metrics && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
            <div className="max-w-2xl mb-8">
              <h3 className="text-xl font-bold text-white">End-to-End Growth Funnel</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Conversion metrics across every touchpoint of the 7-day campus campaign.
              </p>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-4">
              {metrics.funnel.map((step, idx) => (
                <div key={idx} className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{step.step}</h4>
                      <p className="text-xs text-slate-400">Total: {step.count.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Conversion from Top</span>
                      <span className="text-sm font-bold text-cyan-400">{step.conversion_from_start}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Step-to-Step</span>
                      <span className="text-sm font-bold text-emerald-400">{step.conversion_from_prev}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Loop Insights Callout */}
            <div className="mt-8 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Growth Engineer Analysis
              </h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                By gamifying registration through an inter-college challenge, each student brings an average of <strong>{metrics.viral_coefficient} additional participants</strong>. This lowers blended CAC to negligible amounts (₹{(2000 / Math.max(1, metrics.total_registrations)).toFixed(1)}/student), comfortably hitting the 500 registration target on a ₹2,000 budget.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: REGISTRATIONS CRM ----------------- */}
      {activeAdminTab === 'registrations' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls & Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search student, email, referral code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadRegistrations()}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              >
                <option value="">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Other">Other</option>
              </select>

              <button
                onClick={loadRegistrations}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV ({registrations.length})
            </button>
          </div>

          {/* Registrations Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">College</th>
                    <th className="py-3 px-3">Branch & Year</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-3">Referral Code</th>
                    <th className="py-3 px-3">Referred By</th>
                    <th className="py-3 px-3 text-center">Refs Made</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {registrations.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{st.name}</p>
                        <p className="text-[10px] text-slate-400">{st.email}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {st.college_name}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {st.branch} • {st.year}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-cyan-300">{st.ai_readiness_score}</span>
                        <span className="block text-[9px] text-slate-500">{st.score_tier}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-300">
                        {st.referral_code}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {st.referred_by || '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {st.referrals_generated}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {st.is_suspicious ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            Flagged
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Valid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSuspicious(st.id)}
                          className={`p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                            st.is_suspicious
                              ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40'
                              : 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/40'
                          }`}
                        >
                          {st.is_suspicious ? 'Unflag' : 'Flag'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: COLLEGES MANAGEMENT ----------------- */}
      {activeAdminTab === 'colleges' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Participating Institutions & Fairness Settings</h3>
            <button
              onClick={() => setShowAddCollege(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add College
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">College Name</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Registered</th>
                    <th className="py-3 px-4 text-right">Eligible Population (Final Years)</th>
                    <th className="py-3 px-4 text-right">Participation Rate</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {colleges.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.city || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-black text-cyan-400 text-sm">{c.student_count}</td>
                      <td className="py-3.5 px-4 text-right">
                        {editingCollege?.id === c.id ? (
                          <input
                            type="number"
                            value={editingCollege.eligible_students}
                            onChange={(e) => setEditingCollege({ ...editingCollege, eligible_students: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-right text-white font-mono"
                          />
                        ) : (
                          <span className="font-mono text-slate-300">~{c.eligible_students}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {c.participation_rate}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {editingCollege?.id === c.id ? (
                          <button
                            onClick={() => handleSaveCollegeEdit(c.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px]"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingCollege({ id: c.id, eligible_students: c.eligible_students })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add College Modal */}
          {showAddCollege && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <h4 className="text-lg font-bold text-white mb-4">Add Participating College</h4>
                <form onSubmit={handleCreateCollege} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">College Name</label>
                    <input
                      type="text"
                      required
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={newColCity}
                      onChange={(e) => setNewColCity(e.target.value)}
                      placeholder="e.g. Warangal"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Eligible Student Population</label>
                    <input
                      type="number"
                      required
                      value={newColEligible}
                      onChange={(e) => setNewColEligible(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Add College
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCollege(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 5: A/B EXPERIMENTS ----------------- */}
      {activeAdminTab === 'experiments' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Growth A/B Experiments Tracker</h3>
              <p className="text-xs text-slate-400">Testing core conversion hypotheses for the 7-day challenge</p>
            </div>
            <button
              onClick={() => setShowAddExp(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log New Experiment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {experiments.map((exp) => (
              <div key={exp.id} className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-cyan-300 border border-indigo-500/30">
                      {exp.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">EXP-{exp.id}</span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">{exp.name}</h4>
                  <p className="text-xs text-slate-300 mb-4 italic">"{exp.hypothesis}"</p>

                  <div className="space-y-2 text-xs mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Variant A (Control):</span>
                      <span className="text-slate-300">{exp.variant_a}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
                      <span className="text-cyan-400 font-semibold block text-[10px] uppercase">Variant B (Challenger):</span>
                      <span className="text-white font-medium">{exp.variant_b}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Primary Metric: </span>
                  <strong className="text-emerald-400">{exp.metric}</strong>
                  {exp.notes && (
                    <p className="mt-1 text-slate-400 text-[10px] bg-slate-950 p-2 rounded-lg">
                      {exp.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Experiment Modal */}
          {showAddExp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <h4 className="text-lg font-bold text-white mb-4">Log Growth Hypothesis</h4>
                <form onSubmit={handleCreateExperiment} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Experiment Name</label>
                    <input
                      type="text"
                      required
                      value={newExpData.name}
                      onChange={(e) => setNewExpData({ ...newExpData, name: e.target.value })}
                      placeholder="e.g. WhatsApp Group Leaderboard Card Preview"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Hypothesis</label>
                    <textarea
                      required
                      value={newExpData.hypothesis}
                      onChange={(e) => setNewExpData({ ...newExpData, hypothesis: e.target.value })}
                      placeholder="We believe that..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Variant A</label>
                      <input
                        type="text"
                        required
                        value={newExpData.variant_a}
                        onChange={(e) => setNewExpData({ ...newExpData, variant_a: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Variant B</label>
                      <input
                        type="text"
                        required
                        value={newExpData.variant_b}
                        onChange={(e) => setNewExpData({ ...newExpData, variant_b: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Key Success Metric</label>
                    <input
                      type="text"
                      required
                      value={newExpData.metric}
                      onChange={(e) => setNewExpData({ ...newExpData, metric: e.target.value })}
                      placeholder="e.g. Share-to-Registration CTR"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                      Save Experiment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
