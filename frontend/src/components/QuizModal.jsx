import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchQuizQuestions, submitQuiz, trackFunnel } from '../api';

export default function QuizModal({ isOpen, onClose, onCompleteQuiz }) {
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
      trackFunnel('quiz_start');
    } else {
      // Reset state on close
      setCurrentStep(0);
      setAnswers({});
      setQuizResult(null);
    }
  }, [isOpen]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await fetchQuizQuestions();
      setQuizData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const questions = quizData?.questions || [];
  const currentQ = questions[currentStep];

  const handleSelectOption = (score) => {
    const updatedAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit(updatedAnswers);
    }
  };

  const handleFinalSubmit = async (finalAnswers) => {
    try {
      setSubmitting(true);
      const res = await submitQuiz(finalAnswers);
      setQuizResult(res);
      trackFunnel('quiz_complete', { score: res.score, tier: res.tier });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'AI Ready':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Building':
        return 'bg-blue-500/20 text-cyan-300 border-blue-500/40';
      case 'Exploring':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <p className="mt-3 text-sm text-slate-300">Loading AI Readiness Assessment...</p>
          </div>
        ) : quizResult ? (
          /* RESULT SCREEN */
          <div className="text-center py-2 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Assessment Complete
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Your AI Readiness Score
            </h3>

            {/* Score Ring / Display */}
            <div className="my-5 flex items-center justify-center">
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-1 flex items-center justify-center shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{quizResult.score}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="inline-block mb-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getTierColor(quizResult.tier)}`}>
                {quizResult.tier}
              </span>
            </div>

            {/* Encouraging copy */}
            <h4 className="text-lg font-bold text-white max-w-md mx-auto">
              {quizResult.tier === 'AI Ready'
                ? "You're primed for the next wave of AI engineering."
                : quizResult.tier === 'Building'
                ? "You have a solid foundation — ready to build something real."
                : "You're getting started — and that's okay!"}
            </h4>

            <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {quizResult.message}
            </p>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>This is a quick self-assessment, not an academic exam.</span>
            </div>

            {/* Primary Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => onCompleteQuiz(quizResult)}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>Register for Free & Help Your College Reach #1</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : submitting ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
            <h3 className="mt-4 text-lg font-bold text-white">Calculating Your AI Readiness...</h3>
            <p className="mt-1 text-xs text-slate-400">Analyzing your responses across 5 engineering dimensions</p>
          </div>
        ) : (
          /* QUESTION CARD */
          <div>
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-cyan-400">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>~30 seconds total</span>
            </div>

            {/* Progress Line */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6 leading-snug">
              {currentQ?.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ?.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.score)}
                  className="w-full text-left p-4 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                    {opt.label}
                  </span>
                  <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-[11px] text-slate-400">
              Select the option that best represents your current level.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
