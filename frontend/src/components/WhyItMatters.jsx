import React from 'react';
import { HelpCircle, CheckCircle2, UserPlus, Users2, Rocket, ArrowRight, Share2, Award, Sparkles } from 'lucide-react';

export default function WhyItMatters({ onStartQuiz }) {
  const steps = [
    {
      num: "01",
      title: "Test",
      desc: "Take the 30-second AI Readiness Test and discover your score tier.",
      icon: HelpCircle,
      accent: "from-blue-500 to-indigo-500"
    },
    {
      num: "02",
      title: "Register",
      desc: "Reserve your seat for the free 'Build Your First AI Project in 60 Minutes' workshop.",
      icon: CheckCircle2,
      accent: "from-indigo-500 to-purple-500"
    },
    {
      num: "03",
      title: "Challenge",
      desc: "Get your campus referral link. Invite batchmates to climb the live college leaderboard.",
      icon: Users2,
      accent: "from-purple-500 to-cyan-500"
    },
    {
      num: "04",
      title: "Build",
      desc: "Build and deploy your first working AI project in 60 minutes—hands-on.",
      icon: Rocket,
      accent: "from-cyan-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-900/40 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Why this matters header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase">The AI Engineering Shift</h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            Why this matters for your engineering career
          </h3>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            AI is changing how engineers work across <span className="text-white font-semibold">every single branch</span>. You don't need to be an AI researcher or have years of coding experience to start. The crucial first step is <span className="text-cyan-300 underline underline-offset-4 decoration-cyan-500">building something real</span>.
          </p>
        </div>

        {/* 4-Step Process */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-950/80 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 shadow-lg group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-700 group-hover:text-slate-500 transition-colors">
                    {step.num}
                  </span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.accent} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Growth Loop Visual Banner */}
        <div className="mt-14 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950/60 rounded-2xl p-6 sm:p-8 border border-blue-900/40">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-cyan-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                The Campus Growth Engine
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white">
                How Your College Reaches #1
              </h4>
              <p className="mt-2 text-sm text-slate-300">
                Every valid registration through your referral link raises your college's score on the national leaderboard. Campus pride fuels the momentum!
              </p>
            </div>

            {/* Loop Steps */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                1. Take Quiz
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                2. Get Code
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-semibold">
                3. Share with Batch
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                4. College #1 Rank 🏆
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
