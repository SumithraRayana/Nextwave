import os
import math
import random
import string
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import engine, get_db, Base
from models import College, User, Referral, QuizResult, FunnelEvent, Experiment
from schemas import (
    CollegeResponse, CollegeCreate, CollegeUpdate,
    QuizSubmitRequest, QuizSubmitResponse,
    UserRegisterRequest, UserRegisterResponse,
    StudentDashboardResponse, CollegeLeaderboardItem,
    IndividualLeaderboardItem, AdminDashboardMetrics,
    BranchStat, ScoreTierStat, FunnelStep,
    FunnelEventRequest, AdminLoginRequest, AdminLoginResponse
)
from seed_data import seed_database

# Initialize database tables
Base.metadata.create_all(bind=engine)
# Seed database if empty
seed_database()

app = FastAPI(
    title="NxtWave AI Ready Campus Challenge API",
    description="Backend engine for the 7-day college-vs-college growth challenge prototype",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Helper Functions -----------------
def generate_referral_code(name: str, db: Session) -> str:
    cleaned = "".join(ch for ch in name if ch.isalnum()).upper()
    prefix = cleaned[:4] if len(cleaned) >= 4 else (cleaned + "NXTA")[:4]
    
    for _ in range(50):
        rand_num = random.randint(100, 999)
        code = f"{prefix}{rand_num}"
        existing = db.query(User).filter(User.referral_code == code).first()
        if not existing:
            return code
    
    # Fallback
    rand_suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}{rand_suffix}"

def calculate_tier(score: int) -> tuple[str, str, str]:
    if score >= 80:
        return (
            "AI Ready",
            "Outstanding! You're already experimenting with AI tools and understand modern AI workflows.",
            "Take the 60-min workshop to build and deploy your first production-grade AI project!"
        )
    elif score >= 60:
        return (
            "Building",
            "Great foundation! You understand the basics and are primed to bridge theory into practical engineering tools.",
            "Join the workshop to build an end-to-end working AI project in just 60 minutes."
        )
    elif score >= 40:
        return (
            "Exploring",
            "You're getting started — and that's okay! AI is rapidly reshaping engineering careers.",
            "You don't need any prior AI background. Our 60-minute workshop will get you hands-on."
        )
    else:
        return (
            "Getting Started",
            "Every AI pioneer starts from day one. You are in the best position to pick up practical modern AI tools.",
            "Start right here. Build your first AI project in 60 minutes — zero complex prerequisites needed!"
        )

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "NxtWave AI Ready Campus Challenge", "mode": "demo"}

# --- QUIZ ---
@app.get("/api/quiz/questions")
def get_quiz_questions():
    return {
        "title": "30-Second AI Readiness Test",
        "description": "Find out where you stand for the AI engineering era. 5 quick questions.",
        "disclaimer": "This is a quick self-assessment, not a formal academic evaluation.",
        "questions": [
            {
                "id": "q1",
                "question": "How often do you use modern AI tools (ChatGPT, Claude, Copilot, etc.)?",
                "options": [
                    {"label": "Never / Rarely", "score": 5},
                    {"label": "Occasionally for basic queries", "score": 10},
                    {"label": "Weekly for research or coding", "score": 16},
                    {"label": "Almost every day in my workflow", "score": 20}
                ]
            },
            {
                "id": "q2",
                "question": "Have you built or worked on an AI-powered project or prompt pipeline?",
                "options": [
                    {"label": "No, haven't tried yet", "score": 5},
                    {"label": "Tried following a tutorial once", "score": 10},
                    {"label": "Built a basic working AI prototype", "score": 15},
                    {"label": "Built and deployed multiple AI apps", "score": 20}
                ]
            },
            {
                "id": "q3",
                "question": "How confident are you applying AI directly to your engineering branch (CSE/ECE/Mech/Civil/EEE)?",
                "options": [
                    {"label": "Not confident at all", "score": 5},
                    {"label": "Slightly confident in theory", "score": 10},
                    {"label": "Moderately confident with guidance", "score": 15},
                    {"label": "Very confident in building domain AI solutions", "score": 20}
                ]
            },
            {
                "id": "q4",
                "question": "How comfortable are you with prompting, APIs, and AI workflow automation?",
                "options": [
                    {"label": "Complete beginner", "score": 5},
                    {"label": "Basic prompts only", "score": 10},
                    {"label": "Comfortable chaining prompts & using tools", "score": 15},
                    {"label": "Advanced (building agents, embeddings, integrations)", "score": 20}
                ]
            },
            {
                "id": "q5",
                "question": "If AI rapidly transforms hiring skills for your dream role, how prepared are you to adapt?",
                "options": [
                    {"label": "Unprepared / Unsure where to start", "score": 5},
                    {"label": "Somewhat prepared, looking for roadmap", "score": 10},
                    {"label": "Prepared and actively upskilling", "score": 15},
                    {"label": "Highly prepared and building my AI portfolio", "score": 20}
                ]
            }
        ]
    }

@app.post("/api/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(data: QuizSubmitRequest, db: Session = Depends(get_db)):
    total_score = sum(data.answers.values())
    total_score = max(10, min(100, total_score))
    tier, message, action_prompt = calculate_tier(total_score)

    # Record quiz result
    quiz_res = QuizResult(
        session_id=data.session_id,
        score=total_score,
        score_tier=tier,
        answers=str(data.answers)
    )
    db.add(quiz_res)

    # Track funnel event
    funnel = FunnelEvent(
        event_type="quiz_complete",
        session_id=data.session_id,
        metadata_json=f'{{"score": {total_score}, "tier": "{tier}"}}'
    )
    db.add(funnel)
    db.commit()

    return QuizSubmitResponse(
        score=total_score,
        tier=tier,
        message=message,
        action_prompt=action_prompt
    )

# --- COLLEGES ---
@app.get("/api/colleges")
def list_colleges(db: Session = Depends(get_db)):
    colleges = db.query(College).all()
    results = []
    for c in colleges:
        st_count = db.query(User).filter(User.college_id == c.id).count()
        rate = round((st_count / c.eligible_students) * 100, 2) if c.eligible_students > 0 else 0.0
        results.append({
            "id": c.id,
            "name": c.name,
            "city": c.city,
            "state": c.state,
            "eligible_students": c.eligible_students,
            "student_count": st_count,
            "participation_rate": rate,
            "created_at": c.created_at
        })
    results.sort(key=lambda x: x["student_count"], reverse=True)
    return results

@app.post("/api/colleges", response_model=CollegeResponse)
def create_college(college: CollegeCreate, db: Session = Depends(get_db)):
    existing = db.query(College).filter(College.name.ilike(college.name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="College already exists")
    new_c = College(
        name=college.name.strip(),
        city=college.city,
        state=college.state,
        eligible_students=college.eligible_students
    )
    db.add(new_c)
    db.commit()
    db.refresh(new_c)
    return CollegeResponse(
        id=new_c.id,
        name=new_c.name,
        city=new_c.city,
        state=new_c.state,
        eligible_students=new_c.eligible_students,
        student_count=0,
        participation_rate=0.0,
        created_at=new_c.created_at
    )

@app.put("/api/colleges/{college_id}", response_model=CollegeResponse)
def update_college(college_id: int, update_data: CollegeUpdate, db: Session = Depends(get_db)):
    c = db.query(College).filter(College.id == college_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="College not found")
    if update_data.name is not None:
        c.name = update_data.name
    if update_data.city is not None:
        c.city = update_data.city
    if update_data.state is not None:
        c.state = update_data.state
    if update_data.eligible_students is not None:
        c.eligible_students = update_data.eligible_students
    db.commit()
    db.refresh(c)
    
    st_count = db.query(User).filter(User.college_id == c.id).count()
    rate = round((st_count / c.eligible_students) * 100, 2) if c.eligible_students > 0 else 0.0
    return CollegeResponse(
        id=c.id,
        name=c.name,
        city=c.city,
        state=c.state,
        eligible_students=c.eligible_students,
        student_count=st_count,
        participation_rate=rate,
        created_at=c.created_at
    )

@app.get("/api/colleges/{college_id}")
def get_college_details(college_id: int, db: Session = Depends(get_db)):
    c = db.query(College).filter(College.id == college_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="College not found")
    
    # Calculate college rank
    all_colleges = db.query(
        College.id,
        func.count(User.id).label("student_count")
    ).outerjoin(User, User.college_id == College.id).group_by(College.id).order_by(desc("student_count")).all()
    
    college_rank = 1
    for idx, (cid, count) in enumerate(all_colleges, start=1):
        if cid == college_id:
            college_rank = idx
            break
            
    student_count = db.query(User).filter(User.college_id == c.id).count()
    rate = round((student_count / c.eligible_students) * 100, 2) if c.eligible_students > 0 else 0.0

    # Top champion for this college
    top_champ = db.query(
        User.name,
        func.count(Referral.id).label("ref_count")
    ).join(Referral, Referral.referrer_user_id == User.id)\
     .filter(User.college_id == c.id)\
     .group_by(User.id)\
     .order_by(desc("ref_count")).first()

    champ_name = top_champ[0].split()[0] if top_champ else "None yet"
    champ_refs = top_champ[1] if top_champ else 0

    # Branch distribution in this college
    branch_counts = db.query(User.branch, func.count(User.id)).filter(User.college_id == c.id).group_by(User.branch).all()

    return {
        "id": c.id,
        "name": c.name,
        "city": c.city,
        "state": c.state,
        "eligible_students": c.eligible_students,
        "student_count": student_count,
        "participation_rate": rate,
        "college_rank": college_rank,
        "top_champion": f"{champ_name} ({champ_refs} referrals)",
        "branches": [{"branch": b, "count": cnt} for b, cnt in branch_counts]
    }

# --- REGISTRATION & REFERRALS ---
@app.post("/api/register", response_model=UserRegisterResponse)
def register_student(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Duplicate check: email uniqueness
    normalized_email = req.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"This email is already registered! Use your unique code '{existing.referral_code}' to view your dashboard."
        )

    # 2. Check college exists
    college = db.query(College).filter(College.id == req.college_id).first()
    if not college:
        raise HTTPException(status_code=400, detail="Selected college does not exist")

    # 3. Generate referral code for this student
    my_referral_code = generate_referral_code(req.name, db)

    # 4. Check if student signed up with a valid referral code
    referrer_user = None
    cleaned_ref_code = (req.referral_code_used or "").strip().upper()
    if cleaned_ref_code:
        referrer_user = db.query(User).filter(User.referral_code == cleaned_ref_code).first()

    # 5. Create user
    score = req.ai_readiness_score or 50
    tier = req.score_tier or calculate_tier(score)[0]

    user = User(
        name=req.name.strip(),
        email=normalized_email,
        phone=req.phone.strip() if req.phone else None,
        college_id=req.college_id,
        branch=req.branch,
        year=req.year,
        ai_readiness_score=score,
        score_tier=tier,
        referral_code=my_referral_code,
        referred_by=cleaned_ref_code if referrer_user else None,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 6. If referred by someone, record qualified referral
    if referrer_user and referrer_user.id != user.id:
        ref_record = Referral(
            referrer_user_id=referrer_user.id,
            referred_user_id=user.id,
            referral_code=cleaned_ref_code,
            status="qualified",
            created_at=datetime.utcnow()
        )
        db.add(ref_record)
        # Funnel event for referral signup
        db.add(FunnelEvent(
            event_type="referral_signup",
            session_id=str(user.id),
            metadata_json=f'{{"referrer": "{cleaned_ref_code}", "new_user": "{user.email}"}}'
        ))

    # Funnel event for registration complete
    db.add(FunnelEvent(
        event_type="registration_complete",
        session_id=str(user.id),
        metadata_json=f'{{"college_id": {college.id}, "branch": "{req.branch}"}}'
    ))
    db.commit()

    # 7. Calculate dynamic college rank and registrations
    college_st_count = db.query(User).filter(User.college_id == college.id).count()
    
    # College rank
    colleges_ranked = db.query(
        College.id,
        func.count(User.id).label("cnt")
    ).outerjoin(User, User.college_id == College.id).group_by(College.id).order_by(desc("cnt")).all()
    
    college_rank = 1
    for idx, (cid, cnt) in enumerate(colleges_ranked, start=1):
        if cid == college.id:
            college_rank = idx
            break

    # Individual rank
    champs_ranked = db.query(
        User.id,
        func.count(Referral.id).label("ref_cnt")
    ).outerjoin(Referral, Referral.referrer_user_id == User.id)\
     .group_by(User.id)\
     .order_by(desc("ref_cnt")).all()
    
    indiv_rank = len(champs_ranked)
    for idx, (uid, _) in enumerate(champs_ranked, start=1):
        if uid == user.id:
            indiv_rank = idx
            break

    return UserRegisterResponse(
        user_id=user.id,
        name=user.name,
        email=user.email,
        college_id=college.id,
        college_name=college.name,
        referral_code=user.referral_code,
        ai_readiness_score=user.ai_readiness_score,
        score_tier=user.score_tier,
        referral_count=0,
        college_rank=college_rank,
        college_registrations=college_st_count,
        individual_rank=indiv_rank,
        share_url=f"/register?ref={user.referral_code}"
    )

@app.get("/api/students/{identifier}", response_model=StudentDashboardResponse)
def get_student_dashboard(identifier: str, db: Session = Depends(get_db)):
    # identifier can be referral_code or user_id or email
    user = None
    if identifier.isdigit():
        user = db.query(User).filter(User.id == int(identifier)).first()
    if not user:
        user = db.query(User).filter(User.referral_code == identifier.upper()).first()
    if not user:
        user = db.query(User).filter(User.email == identifier.lower()).first()

    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    college = db.query(College).filter(College.id == user.college_id).first()
    
    # Referrals count
    ref_count = db.query(Referral).filter(Referral.referrer_user_id == user.id).count()

    # Next milestone (e.g. 5, 10, 20)
    milestones = [3, 5, 10, 15, 25, 50]
    next_milestone = next((m for m in milestones if m > ref_count), ref_count + 5)

    # College rank and count
    colleges_ranked = db.query(
        College.id,
        func.count(User.id).label("cnt")
    ).outerjoin(User, User.college_id == College.id).group_by(College.id).order_by(desc("cnt")).all()

    college_rank = 1
    college_registrations = 0
    for idx, (cid, cnt) in enumerate(colleges_ranked, start=1):
        if cid == user.college_id:
            college_rank = idx
            college_registrations = cnt
            break

    # Individual rank
    champs_ranked = db.query(
        User.id,
        func.count(Referral.id).label("ref_cnt")
    ).outerjoin(Referral, Referral.referrer_user_id == User.id)\
     .group_by(User.id)\
     .order_by(desc("ref_cnt")).all()

    individual_rank = len(champs_ranked)
    for idx, (uid, _) in enumerate(champs_ranked, start=1):
        if uid == user.id:
            individual_rank = idx
            break

    first_name = user.name.split()[0]
    share_url = f"/register?ref={user.referral_code}"
    
    whatsapp_text = (
        f"🚀 I'm participating in NxtWave's AI Ready Campus Challenge!\n\n"
        f"We're competing to make *{college.name if college else 'our college'}* #1 in India! 🏆\n\n"
        f"Join the FREE 'Build Your First AI Project in 60 Minutes' workshop.\n"
        f"Test your AI readiness & help our campus climb the leaderboard:\n"
        f"👉 https://campus-challenge.nxtwave.tech{share_url}\n\n"
        f"Use my referral code: *{user.referral_code}*"
    )

    # Recent referrals made by this user
    recent_refs = db.query(
        User.name,
        User.branch,
        Referral.created_at
    ).join(Referral, Referral.referred_user_id == User.id)\
     .filter(Referral.referrer_user_id == user.id)\
     .order_by(desc(Referral.created_at)).limit(10).all()

    recent_list = [
        {
            "name": r[0].split()[0], # First name only for privacy
            "branch": r[1],
            "time_ago": r[2].strftime("%d %b, %H:%M")
        }
        for r in recent_refs
    ]

    return StudentDashboardResponse(
        user_id=user.id,
        name=user.name,
        first_name=first_name,
        email=user.email,
        college_name=college.name if college else "Unknown College",
        college_id=user.college_id,
        branch=user.branch,
        year=user.year,
        referral_code=user.referral_code,
        ai_readiness_score=user.ai_readiness_score,
        score_tier=user.score_tier,
        referrals_count=ref_count,
        next_milestone=next_milestone,
        college_rank=college_rank,
        college_registrations=college_registrations,
        individual_rank=individual_rank,
        share_url=share_url,
        whatsapp_share_text=whatsapp_text,
        recent_referrals=recent_list
    )

# --- LEADERBOARDS ---
@app.get("/api/leaderboard/colleges", response_model=List[CollegeLeaderboardItem])
def get_college_leaderboard(sort_by: str = Query("registrations", regex="^(registrations|rate)$"), db: Session = Depends(get_db)):
    colleges = db.query(College).all()
    results = []

    for c in colleges:
        st_count = db.query(User).filter(User.college_id == c.id).count()
        rate = round((st_count / c.eligible_students) * 100, 2) if c.eligible_students > 0 else 0.0

        top_champ = db.query(
            User.name,
            func.count(Referral.id).label("ref_count")
        ).join(Referral, Referral.referrer_user_id == User.id)\
         .filter(User.college_id == c.id)\
         .group_by(User.id)\
         .order_by(desc("ref_count")).first()

        champ_first = top_champ[0].split()[0] if top_champ else "None"
        champ_refs = top_champ[1] if top_champ else 0

        results.append({
            "id": c.id,
            "name": c.name,
            "city": c.city,
            "qualified_students": st_count,
            "eligible_students": c.eligible_students,
            "participation_rate": rate,
            "top_champion_name": champ_first,
            "top_champion_referrals": champ_refs
        })

    if sort_by == "rate":
        results.sort(key=lambda x: x["participation_rate"], reverse=True)
    else:
        results.sort(key=lambda x: x["qualified_students"], reverse=True)

    ranked_items = []
    for rank, item in enumerate(results, start=1):
        ranked_items.append(CollegeLeaderboardItem(
            rank=rank,
            id=item["id"],
            name=item["name"],
            city=item["city"],
            qualified_students=item["qualified_students"],
            eligible_students=item["eligible_students"],
            participation_rate=item["participation_rate"],
            top_champion_name=item["top_champion_name"],
            top_champion_referrals=item["top_champion_referrals"]
        ))

    return ranked_items

@app.get("/api/leaderboard/champions", response_model=List[IndividualLeaderboardItem])
def get_individual_leaderboard(limit: int = 15, db: Session = Depends(get_db)):
    champs = db.query(
        User.id,
        User.name,
        College.name.label("college_name"),
        User.branch,
        func.count(Referral.id).label("ref_count")
    ).join(College, College.id == User.college_id)\
     .outerjoin(Referral, Referral.referrer_user_id == User.id)\
     .group_by(User.id)\
     .having(func.count(Referral.id) > 0)\
     .order_by(desc("ref_count"), User.created_at.asc())\
     .limit(limit).all()

    items = []
    for idx, c in enumerate(champs, start=1):
        items.append(IndividualLeaderboardItem(
            rank=idx,
            first_name=c.name.split()[0], # Privacy preservation: first name only!
            college_name=c.college_name,
            branch=c.branch,
            referrals_count=c.ref_count
        ))
    return items

# --- ADMIN DASHBOARD & ANALYTICS ---
@app.post("/api/admin/login", response_model=AdminLoginResponse)
def admin_login(creds: AdminLoginRequest):
    if creds.username.strip() in ["admin", "admin@nxtwave.tech"] and creds.password.strip() == "admin123":
        return AdminLoginResponse(
            authenticated=True,
            token="nxtwave_growth_admin_token_2026",
            name="Campaign Lead"
        )
    raise HTTPException(status_code=401, detail="Invalid admin credentials. Use admin / admin123")

@app.get("/api/admin/metrics", response_model=AdminDashboardMetrics)
def get_admin_metrics(db: Session = Depends(get_db)):
    total_reg = db.query(User).count()
    qualified_reg = db.query(User).filter(User.is_suspicious == False).count()
    suspicious_count = db.query(User).filter(User.is_suspicious == True).count()
    colleges_count = db.query(College).count()
    
    total_refs = db.query(Referral).count()
    # Users who referred at least 1 person
    active_referrers = db.query(Referral.referrer_user_id).distinct().count()
    viral_coeff = round(total_refs / total_reg, 2) if total_reg > 0 else 0.0

    avg_score_res = db.query(func.avg(User.ai_readiness_score)).scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res else 50.0

    progress_pct = round((total_reg / 500) * 100, 1)

    # Branch distribution
    branches = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "Other"]
    branch_stats = []
    for b in branches:
        cnt = db.query(User).filter(User.branch == b).count()
        pct = round((cnt / total_reg) * 100, 1) if total_reg > 0 else 0.0
        branch_stats.append(BranchStat(branch=b, count=cnt, percentage=pct))

    # Score distribution
    tiers_info = [
        ("Getting Started", "0-39"),
        ("Exploring", "40-59"),
        ("Building", "60-79"),
        ("AI Ready", "80-100")
    ]
    score_stats = []
    for t_name, r_label in tiers_info:
        cnt = db.query(User).filter(User.score_tier == t_name).count()
        pct = round((cnt / total_reg) * 100, 1) if total_reg > 0 else 0.0
        score_stats.append(ScoreTierStat(tier=t_name, range_label=r_label, count=cnt, percentage=pct))

    # Funnel Analytics
    # Pull dynamic or seed counts
    visitors_cnt = max(1240, int(total_reg * 7.5))
    quiz_starts = max(880, int(total_reg * 5.2))
    quiz_completes = max(540, int(total_reg * 3.4))
    reg_cnt = total_reg
    shares_cnt = db.query(FunnelEvent).filter(FunnelEvent.event_type.in_(["referral_copy", "referral_whatsapp", "referral_share"])).count()
    shares_cnt = max(shares_cnt, int(active_referrers * 2.5), 112)
    ref_signups = total_refs

    funnel_data = [
        {"step": "Visitors", "count": visitors_cnt},
        {"step": "Quiz Started", "count": quiz_starts},
        {"step": "Quiz Completed", "count": quiz_completes},
        {"step": "Workshop Registered", "count": reg_cnt},
        {"step": "Referral Link Shared", "count": shares_cnt},
        {"step": "Referral Signups", "count": ref_signups},
    ]

    funnel_steps = []
    base_count = visitors_cnt
    prev_count = visitors_cnt
    for item in funnel_data:
        cnt = item["count"]
        from_start = round((cnt / base_count) * 100, 1) if base_count > 0 else 0.0
        from_prev = round((cnt / prev_count) * 100, 1) if prev_count > 0 else 0.0
        funnel_steps.append(FunnelStep(
            step=item["step"],
            count=cnt,
            conversion_from_start=from_start,
            conversion_from_prev=from_prev
        ))
        prev_count = cnt

    # Top colleges and students
    top_colleges = get_college_leaderboard("registrations", db)[:5]
    top_students = get_individual_leaderboard(5, db)

    return AdminDashboardMetrics(
        target_registrations=500,
        total_registrations=total_reg,
        qualified_registrations=qualified_reg,
        progress_percentage=progress_pct,
        colleges_participating=colleges_count,
        total_referral_links=total_reg,
        total_referral_signups=total_refs,
        avg_readiness_score=avg_score,
        viral_coefficient=viral_coeff,
        branch_distribution=branch_stats,
        score_distribution=score_stats,
        funnel=funnel_steps,
        top_colleges=top_colleges,
        top_students=top_students,
        suspicious_count=suspicious_count
    )

@app.get("/api/admin/registrations")
def get_admin_registrations(
    search: Optional[str] = None,
    college_id: Optional[int] = None,
    branch: Optional[str] = None,
    year: Optional[str] = None,
    is_suspicious: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(User, College.name.label("college_name")).join(College, College.id == User.college_id)
    
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(s)) | (User.email.ilike(s)) | (User.referral_code.ilike(s)))
    if college_id:
        query = query.filter(User.college_id == college_id)
    if branch:
        query = query.filter(User.branch == branch)
    if year:
        query = query.filter(User.year == year)
    if is_suspicious is not None:
        query = query.filter(User.is_suspicious == is_suspicious)

    total = query.count()
    records = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()

    items = []
    for u, col_name in records:
        refs_count = db.query(Referral).filter(Referral.referrer_user_id == u.id).count()
        items.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "college_id": u.college_id,
            "college_name": col_name,
            "branch": u.branch,
            "year": u.year,
            "ai_readiness_score": u.ai_readiness_score,
            "score_tier": u.score_tier,
            "referral_code": u.referral_code,
            "referred_by": u.referred_by,
            "referrals_generated": refs_count,
            "is_suspicious": u.is_suspicious,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return {"total": total, "items": items}

@app.post("/api/admin/registrations/{user_id}/toggle-suspicious")
def toggle_suspicious(user_id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_suspicious = not u.is_suspicious
    db.commit()
    return {"id": u.id, "is_suspicious": u.is_suspicious}

@app.get("/api/admin/experiments")
def get_experiments(db: Session = Depends(get_db)):
    return db.query(Experiment).all()

@app.post("/api/admin/experiments")
def create_experiment(exp: dict, db: Session = Depends(get_db)):
    new_exp = Experiment(
        name=exp.get("name", "Untitled Experiment"),
        hypothesis=exp.get("hypothesis", ""),
        variant_a=exp.get("variant_a", "Control"),
        variant_b=exp.get("variant_b", "Challenger"),
        metric=exp.get("metric", "Conversion Rate"),
        status=exp.get("status", "active"),
        notes=exp.get("notes", "")
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@app.post("/api/admin/reset-demo")
def reset_demo_data():
    seed_database()
    return {"status": "success", "message": "Demo data successfully re-seeded with 12 colleges, ~140 students, and active referral trees."}

# --- FUNNEL TRACKING ---
@app.post("/api/funnel/track")
def track_funnel_event(req: FunnelEventRequest, db: Session = Depends(get_db)):
    ev = FunnelEvent(
        event_type=req.event_type,
        session_id=req.session_id,
        metadata_json=str(req.metadata or {}),
        created_at=datetime.utcnow()
    )
    db.add(ev)
    db.commit()
    return {"status": "tracked"}
