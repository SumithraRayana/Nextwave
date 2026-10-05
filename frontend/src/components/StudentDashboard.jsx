import React, { useState, useEffect } from 'react';
import { Copy, Share2, Trophy, Users, Award, TrendingUp, CheckCircle, Sparkles, RefreshCw, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { fetchStudentDashboard, trackFunnel } from '../api';

export default function StudentDashboard({ studentIdentifier, onBackToLeaderboard }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (studentIdentifier) {
      loadDashboard();
    }
  }, [studentIdentifier]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchStudentDashboard(studentIdentifier);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = (code) => {
    return `${window.location.origin}/?ref=${code}`;
  };

  const copyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(getFullShareUrl(data.referral_code));
    setCopied(true);
    trackFunnel('referral_copy', { code: data.referral_code });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMessage = () => {
    if (!data) return;
    const msg = 
`🚀 I'm joining NxtWave's AI Ready Campus Challenge!

We're competing to make *${data.college_name}* #1 in India! 🏆

Join the free "Build Your First AI Project in 60 Minutes" workshop:
👉 ${getFullShareUrl(data.referral_code)}

Help our college move up the live leaderboard! Use code: *${data.referral_code}*`;

    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    trackFunnel('referral_copy_message', { code: data.referral_code });
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!data) return;
    const shareUrl = getFullShareUrl(data.referral_code);
    const text = encodeURIComponent(
      `🚀 I'm joining NxtWave's AI Ready Campus Challenge!\n\n` +
      `We're competing to make *${data.college_name}* #1 in India! 🏆\n\n` +
      `Join the free "Build Your First AI Project in 60 Minutes" workshop:\n` +
      `👉 ${shareUrl}\n\n` +
      `Help our college move up the leaderboard! Code: *${data.referral_code}*`
    );
    trackFunnel('referral_whatsapp', { code: data.referral_code });
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="mt-3 text-sm text-slate-400">Loading your Campus Growth Hub...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h3 className="text-xl font-bold text-white">Student Record Not Found</h3>
        <p className="mt-2 text-sm text-slate-400">Please register or check the referral code.</p>
        <button
          onClick={onBackToLeaderboard}
          className="mt-6 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm"
        >
          Back to Leaderboard
        </button>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((data.referrals_count / data.next_milestone) * 100));

  return (
    <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Top Breadcrumb & Refresh */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToLeaderboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to National Leaderboard
        </button>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Campus Ambassador
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Hey {data.first_name}! 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Representing <strong className="text-white font-semibold">{data.college_name}</strong> • {data.branch}
            </p>
          </div>

          {/* AI Score Badge */}
          <div className="bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-cyan-400">{data.ai_readiness_score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Readiness</span>
              <span className="text-xs font-bold text-emerald-400">{data.score_tier}</span>
            </div>
          </div>
        </div>

        {/* 4 Core Growth Metrics */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-emerald-400" />
              Your Referrals
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {data.referrals_count}
            </p>
            <p className="text-[11px] text-emerald-400 mt-0.5">Valid classmates joined</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Trophy className="w-4 h-4 text-amber-400" />
              College Rank
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              #{data.college_rank}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Out of participating colleges</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Campus Registrations
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {data.college_registrations}
            </p>
            <p className="text-[11px] text-cyan-400 mt-0.5">Total from your college</p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Award className="w-4 h-4 text-indigo-400" />
              Individual Rank
            </span>
            <p className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">
              #{data.individual_rank}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">On Campus Champions</p>
          </div>

        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-6 bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-200">
              Campus Ambassador Milestone: <span className="text-cyan-400">{data.referrals_count} / {data.next_milestone} referrals</span>
            </span>
            <span className="text-slate-400">{data.next_milestone - data.referrals_count} more to level up!</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Viral Share Engine Section */}
        <div className="mt-8 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/40 rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Invite More Classmates & Elevate {data.college_name.split(' ')[0]}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Every registration using your link gives your college +1 point on the national board.
              </p>
            </div>
            <div className="bg-slate-900 border border-cyan-500/40 px-3 py-1.5 rounded-xl self-start sm:self-auto text-xs">
              <span className="text-slate-400">Your Referral Code: </span>
              <strong className="font-mono text-cyan-300 tracking-wider font-bold">{data.referral_code}</strong>
            </div>
          </div>

          {/* Quick Copy Link Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 mb-4">
            <input
              type="text"
              readOnly
              value={getFullShareUrl(data.referral_code)}
              className="bg-transparent text-xs text-slate-200 font-mono px-2 py-1 outline-none select-all flex-1"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Share Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={shareWhatsApp}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Share2 className="w-4 h-4" />
              1-Click Share to Class WhatsApp Groups
            </button>

            <button
              onClick={copyMessage}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Copy className="w-4 h-4" />
              {copiedMsg ? 'Message Copied!' : 'Copy Pre-Written Share Message'}
            </button>
          </div>
        </div>

        {/* Live List of Referrals */}
        <div className="mt-8">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Classmates Who Joined Via Your Code ({data.recent_referrals?.length || 0})</span>
            <span className="text-xs text-slate-400 font-normal">Real-time updates</span>
          </h4>

          {data.recent_referrals && data.recent_referrals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {data.recent_referrals.map((ref, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-cyan-400 flex items-center justify-center font-bold">
                      {ref.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{ref.name} (Peer)</p>
                      <p className="text-[11px] text-slate-400">{ref.branch} • Joined {ref.time_ago}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    +1 Point
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center">
              <p className="text-xs text-slate-400">
                No referrals yet! Share your link in your college Discord or WhatsApp groups to start climbing the board.
              </p>
            </div>
          )}
        </div>

      </div>

    </section>
  );
}
