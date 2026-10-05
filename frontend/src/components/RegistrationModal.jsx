import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy, Share2, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { registerStudent, trackFunnel } from '../api';

export default function RegistrationModal({
  isOpen,
  onClose,
  quizResult,
  colleges,
  referralCodeFromUrl,
  onRegistrationSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college_id: '',
    branch: 'CSE',
    year: '4th Year (2025)',
    referral_code_used: referralCodeFromUrl || '',
    consent: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (referralCodeFromUrl) {
      setFormData(prev => ({ ...prev, referral_code_used: referralCodeFromUrl.toUpperCase() }));
    }
  }, [referralCodeFromUrl]);

  useEffect(() => {
    if (colleges && colleges.length > 0 && !formData.college_id) {
      setFormData(prev => ({ ...prev, college_id: colleges[0].id }));
    }
  }, [colleges]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid college or personal email');
      return;
    }
    if (!formData.college_id) {
      setError('Please select your engineering college');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        college_id: parseInt(formData.college_id),
        branch: formData.branch,
        year: formData.year,
        ai_readiness_score: quizResult ? quizResult.score : 50,
        score_tier: quizResult ? quizResult.tier : 'Exploring',
        referral_code_used: formData.referral_code_used ? formData.referral_code_used.trim().toUpperCase() : null,
        consent: formData.consent
      };

      const result = await registerStudent(payload);
      setSuccessData(result);
      triggerConfetti();
      trackFunnel('registration_complete', {
        college_id: result.college_id,
        branch: result.branch,
        with_referral: !!payload.referral_code_used
      });
      if (onRegistrationSuccess) {
        onRegistrationSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = (code) => {
    return `${window.location.origin}/?ref=${code}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    trackFunnel('referral_copy');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!successData) return;
    const shareUrl = getFullShareUrl(successData.referral_code);
    const text = encodeURIComponent(
      `🚀 I'm participating in NxtWave's AI Ready Campus Challenge!\n\n` +
      `We're competing to make *${successData.college_name}* #1 in India! 🏆\n\n` +
      `Join the FREE "Build Your First AI Project in 60 Minutes" workshop.\n` +
      `Take the test & help our college move up the leaderboard:\n` +
      `👉 ${shareUrl}\n\n` +
      `Use my referral code: *${successData.referral_code}*`
    );
    trackFunnel('referral_whatsapp');
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successData ? (
          /* REGISTRATION SUCCESS CARD */
          <div className="text-center py-2 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white">🎉 You're Registered!</h3>
            <p className="mt-1 text-sm text-slate-300">
              Seat confirmed for <strong className="text-cyan-300">Build Your First AI Project in 60 Minutes</strong>
            </p>

            {/* Campus Impact Card */}
            <div className="mt-6 bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Your College</span>
                  <h4 className="text-base font-bold text-white">{successData.college_name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Current Rank</span>
                  <p className="text-lg font-black text-amber-400">#{successData.college_rank}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 rounded-lg p-2.5">
                  <span className="text-slate-400 block">Total Campus Registrations</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{successData.college_registrations}</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-2.5">
                  <span className="text-slate-400 block">Your Referrals Count</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{successData.referral_count}</span>
                </div>
              </div>
            </div>

            {/* Referral Sharing Box */}
            <div className="mt-6 bg-gradient-to-r from-blue-950/40 to-cyan-950/40 rounded-2xl p-5 border border-cyan-500/30 text-left">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Help your college reach #1
                </h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {successData.referral_code}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Every friend who registers through your link pushes your college up the live leaderboard and boosts your Campus Champion rank.
              </p>

              {/* URL Display */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl(successData.referral_code)}
                  className="bg-transparent text-xs text-slate-300 flex-1 outline-none font-mono px-1 select-all"
                />
                <button
                  onClick={() => copyToClipboard(getFullShareUrl(successData.referral_code))}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => {
                    const msg = `🚀 Join the NxtWave AI Ready Campus Challenge! Help ${successData.college_name} reach #1. Free 60-min workshop: ${getFullShareUrl(successData.referral_code)}`;
                    copyToClipboard(msg);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Copy Text
                </button>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Go to Campus Leaderboard
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free Workshop Seat
              </div>
              <h3 className="text-2xl font-extrabold text-white">Join the Campus Challenge</h3>
              <p className="text-xs text-slate-300 mt-1">
                Register for the "Build Your First AI Project in 60 Minutes" workshop and compete for your college.
              </p>

              {quizResult && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Your AI Readiness:</span>
                  <span className="font-bold text-cyan-300">
                    {quizResult.score}/100 ({quizResult.tier})
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumithra Rao"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  College / Personal Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sumithra@engineering.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  WhatsApp Number <span className="text-slate-500">(Optional - for workshop reminders)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {/* College Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Your College <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.college_id}
                  onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">-- Choose your engineering college --</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city || 'India'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch & Year in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="CSE">CSE / IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Other">Other Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="4th Year (2025)">4th Year (2025 Passout)</option>
                    <option value="4th Year (2024 Passed)">2024 Passed Out</option>
                    <option value="3rd Year">3rd Year (Pre-final)</option>
                  </select>
                </div>
              </div>

              {/* Referral Code Used */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Referral Code <span className="text-slate-500">(Auto-applied if invited by a friend)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. RAHU101"
                  value={formData.referral_code_used}
                  onChange={(e) => setFormData({ ...formData, referral_code_used: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 uppercase transition-colors"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 accent-cyan-500 rounded"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-400 leading-tight">
                  I agree to participate in the NxtWave AI Ready Campus Challenge and receive free workshop credentials.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Registering for Free...</span>
                  ) : (
                    <>
                      <span>Register for Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
