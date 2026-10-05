import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyItMatters from './components/WhyItMatters';
import AnyBranch from './components/AnyBranch';
import LeaderboardView from './components/LeaderboardView';
import QuizModal from './components/QuizModal';
import RegistrationModal from './components/RegistrationModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import FooterCTA from './components/FooterCTA';
import { fetchColleges, fetchAdminMetrics, trackFunnel } from './api';
import { Sparkles, Trophy, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'leaderboard' | 'admin' | 'student'
  const [quizOpen, setQuizOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [metrics, setMetrics] = useState(null);
  
  // Active student logged in or registered in this browser
  const [studentUser, setStudentUser] = useState(null);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState('');

  useEffect(() => {
    // 1. Capture referral code or college from URL query params
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCodeFromUrl(ref.toUpperCase());
    }

    // 2. Load stored student user if available
    const savedStudent = localStorage.getItem('nxt_student_user');
    if (savedStudent) {
      try {
        setStudentUser(JSON.parse(savedStudent));
      } catch (e) {}
    }

    // 3. Track visitor funnel
    trackFunnel('visitor', { ref });

    // 4. Load baseline data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [colData, metricData] = await Promise.all([
        fetchColleges(),
        fetchAdminMetrics()
      ]);
      setColleges(colData);
      setMetrics(metricData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleStartQuiz = () => {
    setQuizOpen(true);
  };

  const handleCompleteQuiz = (result) => {
    setQuizResult(result);
    setQuizOpen(false);
    setRegistrationOpen(true);
  };

  const handleRegistrationSuccess = (newStudent) => {
    setStudentUser(newStudent);
    localStorage.setItem('nxt_student_user', JSON.stringify(newStudent));
    loadInitialData();
  };

  const handleJoinChallengeForCollege = (college) => {
    // Opens registration with this college selected
    setRegistrationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartQuiz={handleStartQuiz}
        studentUser={studentUser}
        onOpenStudentPortal={() => setActiveTab('student')}
      />

      {/* Referral Invited Notification Banner (if arriving via referral link) */}
      {referralCodeFromUrl && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-2.5 px-4 text-center text-xs sm:text-sm font-bold text-white shadow-lg flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>
            You've been invited via referral code <span className="bg-black/30 px-2 py-0.5 rounded font-mono">{referralCodeFromUrl}</span>! Register to give your peer and college +1 point!
          </span>
          <button
            onClick={handleStartQuiz}
            className="ml-2 px-3 py-1 rounded-lg bg-white text-slate-950 text-xs font-black hover:bg-slate-100"
          >
            Claim Seat
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onStartQuiz={handleStartQuiz}
              onExploreLeaderboard={() => setActiveTab('leaderboard')}
              metrics={metrics}
            />
            <WhyItMatters onStartQuiz={handleStartQuiz} />
            <AnyBranch onSelectBranchCTA={handleStartQuiz} />
            
            {/* Quick Leaderboard Preview Section on Home */}
            <div className="py-12 max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Live Campus Standings (Preview)
                  </h3>
                  <p className="text-xs text-slate-400">Top engineering institutions this week</p>
                </div>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  View Full 12+ College Leaderboard →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {colleges.slice(0, 3).map((col, idx) => (
                  <div
                    key={col.id}
                    onClick={() => setActiveTab('leaderboard')}
                    className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-600 text-white'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        {col.participation_rate}% Participation
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white truncate">{col.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{col.city || 'India'} • {col.student_count} registered students</p>
                  </div>
                ))}
              </div>
            </div>

            <FooterCTA
              onStartQuiz={handleStartQuiz}
              onExploreLeaderboard={() => setActiveTab('leaderboard')}
            />
          </>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            onJoinChallengeForCollege={handleJoinChallengeForCollege}
          />
        )}

        {activeTab === 'student' && studentUser && (
          <StudentDashboard
            studentIdentifier={studentUser.referral_code || studentUser.user_id}
            onBackToLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onCompleteQuiz={handleCompleteQuiz}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        quizResult={quizResult}
        colleges={colleges}
        referralCodeFromUrl={referralCodeFromUrl}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

    </div>
  );
}
