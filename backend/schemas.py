from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class CollegeBase(BaseModel):
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    eligible_students: int = Field(default=1000, ge=10)

class CollegeCreate(CollegeBase):
    pass

class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    eligible_students: Optional[int] = None

class CollegeResponse(CollegeBase):
    id: int
    created_at: datetime
    student_count: int = 0
    participation_rate: float = 0.0

    class Config:
        from_attributes = True

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[Dict[str, Any]] # e.g. [{"text": "Never", "score": 0}, ...]

class QuizSubmitRequest(BaseModel):
    session_id: Optional[str] = None
    answers: Dict[str, int] # e.g. {"q1": 3, "q2": 2, ...} (scores per question)

class QuizSubmitResponse(BaseModel):
    score: int
    tier: str # Getting Started, Exploring, Building, AI Ready
    message: str
    action_prompt: str

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: Optional[str] = None
    college_id: int
    branch: str
    year: str
    ai_readiness_score: Optional[int] = 50
    score_tier: Optional[str] = "Exploring"
    referral_code_used: Optional[str] = None
    consent: bool = True

class UserRegisterResponse(BaseModel):
    user_id: int
    name: str
    email: str
    college_id: int
    college_name: str
    referral_code: str
    ai_readiness_score: int
    score_tier: str
    referral_count: int = 0
    college_rank: int
    college_registrations: int
    individual_rank: int
    share_url: str

class StudentDashboardResponse(BaseModel):
    user_id: int
    name: str
    first_name: str
    email: str
    college_name: str
    college_id: int
    branch: str
    year: str
    referral_code: str
    ai_readiness_score: int
    score_tier: str
    referrals_count: int
    next_milestone: int
    college_rank: int
    college_registrations: int
    individual_rank: int
    share_url: str
    whatsapp_share_text: str
    recent_referrals: List[Dict[str, Any]] = []

class CollegeLeaderboardItem(BaseModel):
    rank: int
    id: int
    name: str
    city: Optional[str] = None
    qualified_students: int
    eligible_students: int
    participation_rate: float
    top_champion_name: Optional[str] = None
    top_champion_referrals: int = 0

class IndividualLeaderboardItem(BaseModel):
    rank: int
    first_name: str
    college_name: str
    branch: str
    referrals_count: int

class BranchStat(BaseModel):
    branch: str
    count: int
    percentage: float

class ScoreTierStat(BaseModel):
    tier: str
    range_label: str
    count: int
    percentage: float

class FunnelStep(BaseModel):
    step: str
    count: int
    conversion_from_start: float
    conversion_from_prev: float

class AdminDashboardMetrics(BaseModel):
    target_registrations: int = 500
    total_registrations: int
    qualified_registrations: int
    progress_percentage: float
    colleges_participating: int
    total_referral_links: int
    total_referral_signups: int
    avg_readiness_score: float
    viral_coefficient: float
    branch_distribution: List[BranchStat]
    score_distribution: List[ScoreTierStat]
    funnel: List[FunnelStep]
    top_colleges: List[CollegeLeaderboardItem]
    top_students: List[IndividualLeaderboardItem]
    suspicious_count: int

class FunnelEventRequest(BaseModel):
    event_type: str
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    authenticated: bool
    token: str
    name: str
