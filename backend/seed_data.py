import random
from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
from models import College, User, Referral, QuizResult, FunnelEvent, Experiment

# 12 Realistic Engineering Colleges with varying eligible student counts
INITIAL_COLLEGES = [
    {"name": "Apex Institute of Technology", "city": "Hyderabad", "state": "Telangana", "eligible_students": 1200},
    {"name": "Zenith University College of Engineering", "city": "Bengaluru", "state": "Karnataka", "eligible_students": 1800},
    {"name": "National Engineering College", "city": "Chennai", "state": "Tamil Nadu", "eligible_students": 1500},
    {"name": "Vanguard Institute of Science & Tech", "city": "Pune", "state": "Maharashtra", "eligible_students": 950},
    {"name": "Pinnacle College of Engineering", "city": "Hyderabad", "state": "Telangana", "eligible_students": 800},
    {"name": "Metro Technical University", "city": "Delhi NCR", "state": "Delhi", "eligible_students": 2500},
    {"name": "Banyan Tree Institute of Technology", "city": "Kochi", "state": "Kerala", "eligible_students": 600},
    {"name": "Heritage Engineering College", "city": "Kolkata", "state": "West Bengal", "eligible_students": 1100},
    {"name": "Cosmos Institute of Technology", "city": "Jaipur", "state": "Rajasthan", "eligible_students": 750},
    {"name": "Horizon College of Engineering", "city": "Coimbatore", "state": "Tamil Nadu", "eligible_students": 1350},
    {"name": "Trinity Institute of Technology", "city": "Bhopal", "state": "Madhya Pradesh", "eligible_students": 850},
    {"name": "Silver Oak Engineering Academy", "city": "Ahmedabad", "state": "Gujarat", "eligible_students": 1400},
]

FIRST_NAMES = [
    "Rahul", "Priya", "Arjun", "Ananya", "Rohan", "Sneha", "Aditya", "Pooja", 
    "Vikram", "Kavya", "Siddharth", "Meera", "Karthik", "Divya", "Suresh", "Ritu",
    "Manish", "Shreya", "Naveen", "Swati", "Gaurav", "Neha", "Deepak", "Tanvi",
    "Varun", "Ishita", "Tarun", "Aishwarya", "Sameer", "Harini", "Ashwin", "Sanjana",
    "Pranav", "Nandini", "Kishore", "Shruti", "Akash", "Bhavya", "Chetan", "Lakshmi"
]

LAST_NAMES = [
    "Sharma", "Verma", "Reddy", "Rao", "Patel", "Nair", "Iyer", "Kumar", 
    "Singh", "Gupta", "Das", "Joshi", "Menon", "Chowdhury", "Kulkarni", "Deshmukh"
]

BRANCHES = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "Other"]
BRANCH_WEIGHTS = [0.35, 0.22, 0.15, 0.14, 0.08, 0.06]

YEARS = ["4th Year (2025)", "4th Year (2024 Passed)", "3rd Year"]
YEAR_WEIGHTS = [0.85, 0.05, 0.10]

def get_tier(score: int) -> str:
    if score >= 80:
        return "AI Ready"
    elif score >= 60:
        return "Building"
    elif score >= 40:
        return "Exploring"
    else:
        return "Getting Started"

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded with at least 50 users
        existing_users = db.query(User).count()
        if existing_users >= 50:
            print(f"Database already has {existing_users} users. Skipping auto-seed.")
            return

        print("Clearing and seeding fresh demo data...")
        # Clear existing tables
        db.query(Referral).delete()
        db.query(QuizResult).delete()
        db.query(User).delete()
        db.query(College).delete()
        db.query(Experiment).delete()
        db.query(FunnelEvent).delete()
        db.commit()

        # 1. Insert Colleges
        colleges = []
        for col_data in INITIAL_COLLEGES:
            c = College(**col_data)
            db.add(c)
            colleges.append(c)
        db.commit()
        for c in colleges:
            db.refresh(c)

        # 2. Insert Core Experiments
        experiments = [
            Experiment(
                name="College Pride Competition Framing",
                hypothesis="Positioning the free AI workshop as an inter-college battle ('Which college is most ready?') increases registration CTR by >40% vs generic 'Free AI Workshop' messaging.",
                variant_a="Control: 'Free 60-Minute AI Workshop for Final Years'",
                variant_b="Challenger: 'Which College is Most Ready for the AI Era? Join Campus Challenge'",
                metric="Visitor-to-Registration Conversion Rate",
                status="active",
                notes="Early data shows Variant B has 3.1x higher viral loop sharing."
            ),
            Experiment(
                name="Real-time College Leaderboard Referral Hook",
                hypothesis="Showing students that their individual referrals directly lift their college ranking on the public leaderboard increases K-factor (referrals/student) from 0.4 to >1.8.",
                variant_a="Standard Share Link ('Share with friends')",
                variant_b="Leaderboard Hook ('Invite 3 classmates to push Apex Institute to #1')",
                metric="Viral Coefficient (K-factor)",
                status="active",
                notes="Students from Top 3 colleges share 4x more actively than colleges ranked #8+."
            ),
            Experiment(
                name="Branch-Specific AI Relevance Messaging",
                hypothesis="Providing non-CSE students with branch-specific AI examples (e.g. Mechanical -> Predictive maintenance; Civil -> Structural vision) lifts non-CSE participation from 18% to >45%.",
                variant_a="Generic AI coding project",
                variant_b="Branch-tailored cards (AI for IoT, AI for Energy, AI for Structures)",
                metric="Non-CSE Registration Share %",
                status="active",
                notes="ECE and Mechanical have shown the highest engagement spike under tailored messaging."
            )
        ]
        db.add_all(experiments)
        db.commit()

        # 3. Create Sample Registrations (Targeting ~135 realistic users)
        # We will make Apex Institute and Pinnacle College top competitors
        # Apex has high raw count, Pinnacle has high participation rate!
        users = []
        code_counter = 100

        # We'll create top campus champions first so they can receive referrals
        campus_champions = [
            {"name": "Rahul Verma", "college": colleges[0], "branch": "CSE", "score": 88, "tier": "AI Ready"},
            {"name": "Priya Reddy", "college": colleges[1], "branch": "ECE", "score": 76, "tier": "Building"},
            {"name": "Arjun Sharma", "college": colleges[4], "branch": "Mechanical", "score": 68, "tier": "Building"},
            {"name": "Ananya Iyer", "college": colleges[0], "branch": "CSE", "score": 92, "tier": "AI Ready"},
            {"name": "Karthik Nair", "college": colleges[2], "branch": "EEE", "score": 58, "tier": "Exploring"},
            {"name": "Sneha Gupta", "college": colleges[3], "branch": "Civil", "score": 48, "tier": "Exploring"},
            {"name": "Siddharth Joshi", "college": colleges[4], "branch": "CSE", "score": 84, "tier": "AI Ready"},
            {"name": "Kavya Deshmukh", "college": colleges[6], "branch": "ECE", "score": 64, "tier": "Building"},
        ]

        champion_users = []
        for champ in campus_champions:
            code_counter += 1
            first = champ["name"].split()[0].upper()
            ref_code = f"{first[:4]}{code_counter}"
            u = User(
                name=champ["name"],
                email=f"{champ['name'].lower().replace(' ', '.')}@example.com",
                phone=f"98{random.randint(10000000, 99999999)}",
                college_id=champ["college"].id,
                branch=champ["branch"],
                year="4th Year (2025)",
                ai_readiness_score=champ["score"],
                score_tier=champ["tier"],
                referral_code=ref_code,
                referred_by=None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(3, 6), hours=random.randint(1, 23))
            )
            db.add(u)
            champion_users.append(u)
        db.commit()
        for u in champion_users:
            db.refresh(u)
            users.append(u)

        # Distribute referrals among champions:
        # Rahul Verma: 24 referrals
        # Priya Reddy: 19 referrals
        # Arjun Sharma: 17 referrals
        # Ananya Iyer: 14 referrals
        # Karthik Nair: 11 referrals
        # Siddharth Joshi: 9 referrals
        # Sneha Gupta: 6 referrals
        # Kavya Deshmukh: 5 referrals
        champ_referral_quotas = [24, 19, 17, 14, 11, 9, 6, 5]

        referrals_created = []

        # Generate users referred by champions
        for idx, champ in enumerate(champion_users):
            quota = champ_referral_quotas[idx]
            champ_college = next(c for c in colleges if c.id == champ.college_id)
            for q in range(quota):
                code_counter += 1
                fname = random.choice(FIRST_NAMES)
                lname = random.choice(LAST_NAMES)
                name = f"{fname} {lname}"
                email = f"{fname.lower()}.{lname.lower()}{random.randint(10, 999)}@testmail.com"
                branch = random.choices(BRANCHES, weights=BRANCH_WEIGHTS)[0]
                year = random.choices(YEARS, weights=YEAR_WEIGHTS)[0]
                score = random.randint(28, 96)
                tier = get_tier(score)
                ref_code = f"{fname[:3].upper()}{random.randint(100, 999)}"

                # Most referrals come from the same college, but some from friends in other colleges!
                if random.random() < 0.85:
                    u_college = champ_college
                else:
                    u_college = random.choice(colleges)

                reg_time = champ.created_at + timedelta(hours=random.randint(2, 48), minutes=random.randint(0, 50))
                if reg_time > datetime.utcnow():
                    reg_time = datetime.utcnow() - timedelta(minutes=random.randint(5, 120))

                new_u = User(
                    name=name,
                    email=email,
                    phone=f"97{random.randint(10000000, 99999999)}",
                    college_id=u_college.id,
                    branch=branch,
                    year=year,
                    ai_readiness_score=score,
                    score_tier=tier,
                    referral_code=ref_code,
                    referred_by=champ.referral_code,
                    created_at=reg_time
                )
                db.add(new_u)
                db.commit()
                db.refresh(new_u)
                users.append(new_u)

                # Record referral
                ref = Referral(
                    referrer_user_id=champ.id,
                    referred_user_id=new_u.id,
                    referral_code=champ.referral_code,
                    status="qualified",
                    created_at=reg_time
                )
                db.add(ref)

        # Generate additional direct registrations across all colleges (~35 users)
        for i in range(35):
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            name = f"{fname} {lname}"
            email = f"{fname.lower()}.{lname.lower()}{random.randint(1000, 9999)}@student.edu"
            branch = random.choices(BRANCHES, weights=BRANCH_WEIGHTS)[0]
            year = random.choices(YEARS, weights=YEAR_WEIGHTS)[0]
            score = random.randint(25, 95)
            tier = get_tier(score)
            ref_code = f"{fname[:3].upper()}{random.randint(100, 999)}"
            u_college = random.choice(colleges)

            u = User(
                name=name,
                email=email,
                phone=f"91{random.randint(10000000, 99999999)}",
                college_id=u_college.id,
                branch=branch,
                year=year,
                ai_readiness_score=score,
                score_tier=tier,
                referral_code=ref_code,
                referred_by=None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 5), hours=random.randint(1, 23))
            )
            db.add(u)
            users.append(u)

        db.commit()

        # 4. Generate Realistic Funnel Events
        # Let's say:
        # Total Visitors: ~1,240
        # Quiz Starts: ~880 (71.0%)
        # Quiz Completed: ~540 (61.4%)
        # Registrations: len(users) (~148)
        # Referral Link Copied/Shared: ~112
        # Referral Signups: sum(champ_referral_quotas) (~105)
        funnel_counts = {
            "visitor": 1240,
            "quiz_start": 880,
            "quiz_complete": 540,
            "registration_start": 320,
            "registration_complete": len(users),
            "referral_share": 112,
            "referral_signup": sum(champ_referral_quotas)
        }

        for ev_type, count in funnel_counts.items():
            ev = FunnelEvent(
                event_type=ev_type,
                session_id="seed_session",
                metadata_json=f'{{"seed_count": {count}}}',
                created_at=datetime.utcnow()
            )
            db.add(ev)

        db.commit()
        print(f"Successfully seeded {len(colleges)} colleges, {len(users)} users, and {sum(champ_referral_quotas)} referrals!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
