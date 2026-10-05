import React from 'react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';

export default function FooterCTA({ onStartQuiz, onExploreLeaderboard }) {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950">
      
      {/* Big Action Callout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-cyan-900/30 border border-cyan-500/20 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black text-white max-w-2xl mx-auto">
            Ready to make your college #1?
          </h2>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            Take the 30-second AI Readiness Test, reserve your free workshop seat, and help your campus dominate the national leaderboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-cyan-200" />
              <span>Take the AI Readiness Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onExploreLeaderboard}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Check Campus Rankings</span>
            </button>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            <p className="font-semibold text-slate-400">NxtWave AI Ready Campus Challenge</p>
            <p className="text-[11px] mt-0.5">Growth Intern Simulation Asset • 500 Target / ₹2,000 Budget</p>
          </div>

          <div className="text-right text-[11px]">
            <p>100% Free Workshop • "Build Your First AI Project in 60 Minutes"</p>
            <p className="text-slate-600 mt-0.5">Sample data used for demonstration purposes.</p>
          </div>
        </div>
      </div>

    </footer>
  );
}
