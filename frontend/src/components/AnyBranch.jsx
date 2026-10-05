import React from 'react';
import { Cpu, Radio, Wrench, Building2, Zap, Compass, Check } from 'lucide-react';

export default function AnyBranch({ onSelectBranchCTA }) {
  const branches = [
    {
      name: "CSE / IT",
      focus: "AI Software & Autonomous Agents",
      example: "Build smart prompt pipelines, coding copilots, and AI micro-SaaS prototypes.",
      icon: Cpu,
      color: "border-blue-500/30 bg-blue-500/5 text-blue-400"
    },
    {
      name: "ECE",
      focus: "AI + Embedded IoT & Sensors",
      example: "Integrate computer vision with microcontrollers and edge AI data logging.",
      icon: Radio,
      color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
    },
    {
      name: "Mechanical",
      focus: "AI in Manufacturing & CAD",
      example: "Predictive equipment maintenance algorithms and automated defect inspection.",
      icon: Wrench,
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400"
    },
    {
      name: "Civil",
      focus: "AI + Infrastructure Diagnostics",
      example: "Satellite crack detection, project timeline forecasting, and structural safety modeling.",
      icon: Building2,
      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
    },
    {
      name: "EEE",
      focus: "AI in Smart Grids & Energy",
      example: "Peak power load forecasting and smart EV battery health degradation models.",
      icon: Zap,
      color: "border-purple-500/30 bg-purple-500/5 text-purple-400"
    },
    {
      name: "Chemical / Other",
      focus: "Domain-Specific AI Solutions",
      example: "Process yield optimization, automated lab data synthesis, and AI research assistants.",
      icon: Compass,
      color: "border-rose-500/30 bg-rose-500/5 text-rose-400"
    }
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            Universal Engineering Scope
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            AI Isn't Only for Computer Science
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Every engineering branch has massive upcoming AI opportunities. The 60-minute workshop teaches core fundamentals that apply directly to your chosen field.
          </p>
        </div>

        {/* Branch Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${b.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{b.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{b.focus}</p>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Application Example:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {b.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 text-center">
          <button
            onClick={onSelectBranchCTA}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Take the test to see your branch readiness score →
          </button>
        </div>

      </div>
    </section>
  );
}
