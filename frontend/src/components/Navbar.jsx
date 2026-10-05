import React from 'react';
import { Trophy, Sparkles, Shield, Flame, BarChart3, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onStartQuiz, studentUser, onOpenStudentPortal }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Campaign Badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  NxtWave
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                  AI Ready Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">7-Day Inter-College Growth Sprint</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'home' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Challenge Overview
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'leaderboard' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Live Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'admin' ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Admin & Growth Funnel
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {studentUser ? (
              <button
                onClick={onOpenStudentPortal}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">My Campus Code:</span>
                <span className="font-mono font-bold text-white">{studentUser.referral_code}</span>
              </button>
            ) : null}

            <button
              onClick={onStartQuiz}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Take AI Test
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
