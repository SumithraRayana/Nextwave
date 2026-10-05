# NxtWave AI Ready Campus Challenge — Growth Engine Prototype

> **Growth Intern Challenge Submission**  
> **Campaign:** "Build Your First AI Project in 60 Minutes" (100% Free Online Workshop)  
> **Goal:** 500 final-year engineering students registered within 7 days  
> **Budget:** ₹2,000 (~₹4.00 CAC target)  
> **Core Growth Thesis:** Inter-college competition + 30-second AI Readiness diagnostic + real-time campus leaderboard creates a viral loop with **K > 0.7**, slashing paid CAC to near-zero.

---

## 1. Product Concept & Viral Growth Loop

Instead of running generic paid performance ads (which burn through a ₹2,000 budget in hours), this prototype implements an inter-college gamified growth challenge:

> **“Which engineering college in India is most ready for the AI era?”**

```
┌────────────────────────────────────────────────────────┐
│                   THE GROWTH LOOP                      │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
          Student discovers Campus Challenge
                           │
                           ▼
          Takes 30-sec AI Readiness Test
                           │
                           ▼
         Gets AI Readiness Score (0-100) & Tier
                           │
                           ▼
        Registers for FREE 60-min AI Workshop
                           │
                           ▼
        Gets Unique Referral Link (e.g. SUMI878)
                           │
                           ▼
      1-Click WhatsApp Share to College Class Groups
                           │
                           ▼
    Peers register ──▶ College rank rises on Leaderboard
          ▲                                    │
          │                                    ▼
          └────── Campus Pride / FOMO ─────────┘
```

### Why does a student register?
1. **Low Friction Diagnostic:** The 30-second AI test gives immediate self-discovery value.
2. **Relevance Across All Disciplines:** Explains AI relevance for non-CSE (ECE, Mech, Civil, EEE).
3. **100% Free Workshop:** No barrier to entry.
4. **Campus Pride:** Helping their college beat rival regional institutions.

### Why does a student share?
1. **College Ranking Impact:** Every peer referral directly adds +1 point to their college.
2. **Individual Campus Champion Rank:** Students compete on the National Champions leaderboard.
3. **Pre-formatted WhatsApp Messages:** Zero-friction 1-click sharing to class groups.

---

## 2. Fairness Normalization for College Size

A college with 20,000 students would naturally crush a smaller boutique college with 800 students on raw count. To preserve competitive motivation across all campus sizes, the leaderboard supports two ranking modes:
- **Overall Registrations:** Total verified students.
- **Most Engaged Campus (Participation Rate):**  
  $$\text{Participation Rate} = \frac{\text{Qualified Registrations}}{\text{Eligible Final-Year Students}} \times 100$$

---

## 3. Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** FastAPI (Python), SQLite, SQLAlchemy 2.0, Pydantic v2.
- **Analytics & Tracking:** Real-time funnel tracking (Visitor → Quiz → Reg → Share → Viral Signup).

---

## 4. Project Structure

```
nextwave/
├── backend/
│   ├── campus_challenge.db   # SQLite database
│   ├── database.py           # DB connection & session
│   ├── main.py               # FastAPI endpoints & growth engine
│   ├── models.py             # SQLAlchemy models (User, College, Referral, Funnel, Exp)
│   ├── requirements.txt      # Python dependencies
│   ├── schemas.py            # Pydantic request/response schemas
│   └── seed_data.py          # Realistic seed generator (12 colleges, ~150 students)
├── frontend/
│   ├── index.html            # App root HTML with Google fonts
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind brand colors and styling
│   └── src/
│       ├── api.js            # API client with error handling
│       ├── App.jsx           # Main routing & state controller
│       ├── index.css         # Tailwind directives & glow effects
│       └── components/
│           ├── Navbar.jsx            # Top navigation & demo indicator
│           ├── Hero.jsx              # Hero with live 500-target progress bar
│           ├── WhyItMatters.jsx      # 4-step workflow & loop explanation
│           ├── AnyBranch.jsx         # AI relevance beyond CSE cards
│           ├── QuizModal.jsx         # 5-question AI Readiness diagnostic
│           ├── RegistrationModal.jsx # Auto-ref capture & duplicate prevention
│           ├── StudentDashboard.jsx  # Student growth hub & WhatsApp share
│           ├── LeaderboardView.jsx   # College & Campus Champions boards
│           ├── AdminDashboard.jsx    # Metrics, CRM, CSV export, A/B experiments
│           └── FooterCTA.jsx         # High-conversion closing banner
├── test_growth_flow.py       # Automated end-to-end growth loop test
├── run_app.py                # Single-command unified local runner
└── README.md
```

---

## 5. Quick Start (Run Locally)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1-Command Startup
From the project root:
```bash
python run_app.py
```
This automatically boots:
- Backend: **http://127.0.0.1:8000**
- Frontend: **http://127.0.0.1:5173**

### Running Manually

**Terminal 1 (Backend):**
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Demo Walkthrough & Credentials

### Admin Login
- **URL:** Click **"Admin & Growth Funnel"** in the top navigation
- **Username:** `admin` or `admin@nxtwave.tech`
- **Password:** `admin123`

### Complete 10-Step Growth Demo Flow
1. **Explore Homepage:** View the live 500-target progress bar and branch cards.
2. **Take AI Quiz:** Click **"Check My AI Readiness"**. Answer 5 quick questions.
3. **View Score:** Receive your score (e.g. 76/100 — "Building") and encouraging feedback.
4. **Register Free:** Enter student details (e.g. Name: *Sumithra*, College: *Apex Institute*).
5. **Get Referral Link:** Confetti triggers! Referral code `SUMI...` is generated.
6. **Open Student Dashboard:** Check your initial 0 referrals, college rank, and individual position.
7. **Simulate a Peer Referral:**
   - Copy the referral link: `http://127.0.0.1:5173/?ref=SUMI...`
   - Open link in Incognito/another tab. Notice the green referral invite banner!
   - Register a second demo student (e.g. *Aditya Kumar*).
8. **Verify Attribution:** Return to Sumithra's dashboard. Watch referrals count increase from **0 → 1**!
9. **Check Leaderboard:** See Apex Institute's registration count increase on the live board.
10. **Open Admin Dashboard:** View real-time funnel conversion, viral coefficient ($K$), non-CSE distribution, and export student CRM to CSV.

---

## 7. Automated Test Verification

Run the test suite to verify all core logic:
```bash
python test_growth_flow.py
```
**Test Results:**
- API Health & College listing: **PASSED**
- 5-Question Scoring & Tier Logic: **PASSED**
- Registration & Referral Code Generation: **PASSED**
- Duplicate Email Prevention (400 validation): **PASSED**
- Peer Referral Link Attribution ($+1$ referral, $+1$ college): **PASSED**
- Admin Metrics, K-Factor & Funnel Step Integrity: **PASSED**

---

## 8. Free Deployment Instructions

- **Backend (Render / Railway / Fly.io):**
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Frontend (Vercel / Netlify):**
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

---

## 9. Growth Engineering Insights & Next Steps

1. **WhatsApp Group Link Previews:** Implement OpenGraph dynamic preview cards showing `"[Student] invites you: Help [College] stay #1"`.
2. **College Discord/Telegram Bots:** Post hourly campus rank updates to regional student communities.
3. **Faculty & Placement Cell Kits:** 1-click email templates for College TPOs to broadcast to final years.
