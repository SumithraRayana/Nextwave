from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    eligible_students = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("User", back_populates="college")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    branch = Column(String(50), nullable=False)  # CSE, ECE, EEE, Mechanical, Civil, Other
    year = Column(String(20), nullable=False)    # 4th Year, 3rd Year, etc.
    ai_readiness_score = Column(Integer, default=50)
    score_tier = Column(String(50), default="Exploring") # Getting Started, Exploring, Building, AI Ready
    referral_code = Column(String(50), unique=True, nullable=False, index=True)
    referred_by = Column(String(50), nullable=True, index=True) # referral_code of referrer
    is_suspicious = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="students")

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    referral_code = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="qualified") # qualified, duplicate, suspicious
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    score = Column(Integer, nullable=False)
    score_tier = Column(String(50), nullable=False)
    answers = Column(Text, nullable=True) # JSON format
    created_at = Column(DateTime, default=datetime.utcnow)

class FunnelEvent(Base):
    __tablename__ = "funnel_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    session_id = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    hypothesis = Column(Text, nullable=False)
    variant_a = Column(String(255), nullable=False)
    variant_b = Column(String(255), nullable=False)
    metric = Column(String(100), nullable=False)
    status = Column(String(50), default="active") # active, completed, draft
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
