import React from 'react';
import { Sparkles, Trophy, ArrowRight, ShieldCheck, Zap, Users, GraduationCap, Compass } from 'lucide-react';

export default function Hero({ onStartQuiz, onExploreLeaderboard, metrics }) {
  const totalReg = metrics?.total_registrations || 148;
  const targetReg = metrics?.target_registrations || 500;
  const progressPct = Math.min(100, Math.round((totalReg / targetReg) * 100));
  const topCollege = metrics?.top_colleges?.[0];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Value Tag Pills */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-6 text-xs sm:text-sm font-medium text-slate-300">
          <span className="text-cyan-400 font-bold">FREE</span>
          <span className="text-slate-600">•</span>
          <span>60 MINUTES</span>
          <span className="text-slate-600">•</span>
          <span>BEGINNER FRIENDLY</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">ANY ENGINEERING BRANCH</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Which Engineering College Is{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Most Ready
          </span>{' '}
          for the AI Era?
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Join the <strong className="text-white font-semibold">NxtWave AI Ready Campus Challenge</strong>. Take the 30-second AI Readiness Test, build your first working AI project in 60 minutes, and help your campus reach <span className="text-amber-400 font-bold">#1</span>.
        </p>

        {/* 0-to-1 Engineering Philosophy Highlight Card */}
        <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-indigo-950/70 border border-cyan-500/40 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
            <span className="text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20">0 → 1 is the hardest leap</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-400/10 border border-cyan-400/20">1 → 100 is momentum</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Most students get overwhelmed thinking about advanced AI models. But your <strong className="text-white">0th step</strong> is simply building your first working project. <span className="text-cyan-300 font-semibold">Take that 0-to-1 step with us today.</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartQuiz}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-cyan-200" />
            <span>Take Your 0th Step — Check AI Readiness</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onExploreLeaderboard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>View Campus Leaderboard</span>
          </button>
        </div>

        {/* 7-Day Sprint Live Progress Card */}
        <div className="mt-12 max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">7-Day Campus Target</h4>
                <p className="text-xs text-slate-400">Goal: 500 final-year engineers registered across India</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-cyan-400">{totalReg}</span>
              <span className="text-sm text-slate-400 font-medium">/ {targetReg} ({progressPct}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm shadow-cyan-500/50"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Mini Stat Tickers */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Colleges Competing</p>
              <p className="text-lg font-bold text-white mt-0.5">{metrics?.colleges_participating || 12} Campuses</p>
            </div>
            
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current #1 Campus</p>
              <p className="text-sm font-bold text-amber-300 truncate mt-0.5">
                {topCollege ? topCollege.name.split(' ')[0] + ' Tech' : 'Apex Institute'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Workshop Format</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">100% Free • Live 0-to-1 Build</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
