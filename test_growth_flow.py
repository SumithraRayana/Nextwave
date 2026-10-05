import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def post(endpoint, data):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

print("=== 1. TESTING API HEALTH & COLLEGES ===")
status, health = get("/api/health")
assert status == 200, f"Health check failed: {health}"
print(f" Health OK: {health['app']}")

status, colleges = get("/api/colleges")
assert status == 200 and len(colleges) >= 12
college_1 = colleges[0]
print(f" Loaded {len(colleges)} colleges. Current #1: {college_1['name']} ({college_1['student_count']} students)")

print("\n=== 2. TESTING QUIZ SUBMISSION ===")
status, quiz_res = post("/api/quiz/submit", {
    "session_id": "test_sess_01",
    "answers": {"q1": 16, "q2": 15, "q3": 15, "q4": 15, "q5": 15}
})
assert status == 200
print(f" Quiz Score: {quiz_res['score']}/100 -> Tier: '{quiz_res['tier']}'")

print("\n=== 3. TESTING STUDENT REGISTRATION (Sumithra) ===")
test_email = f"sumithra.test.{int(sys.version_info[0])}@example.edu"
status, student_1 = post("/api/register", {
    "name": "Sumithra Rao",
    "email": test_email,
    "phone": "9876543210",
    "college_id": college_1["id"],
    "branch": "CSE",
    "year": "4th Year (2025)",
    "ai_readiness_score": quiz_res["score"],
    "score_tier": quiz_res["tier"]
})
assert status == 200, f"Registration failed: {student_1}"
ref_code = student_1["referral_code"]
print(f" Registered Sumithra! Unique Referral Code: {ref_code}")
print(f" College: {student_1['college_name']} | College Rank: #{student_1['college_rank']}")

print("\n=== 4. TESTING DUPLICATE EMAIL PREVENTION ===")
dup_status, dup_err = post("/api/register", {
    "name": "Sumithra Duplicate",
    "email": test_email,
    "college_id": college_1["id"],
    "branch": "CSE",
    "year": "4th Year (2025)"
})
assert dup_status == 400, f"Expected 400 on duplicate email, got: {dup_status}"
print(f" Duplicate properly rejected with 400: '{dup_err['detail']}'")

print("\n=== 5. CHECK INITIAL STUDENT DASHBOARD ===")
status, dash_before = get(f"/api/students/{ref_code}")
assert status == 200
assert dash_before["referrals_count"] == 0
print(f" Sumithra's initial referrals: {dash_before['referrals_count']}")

print("\n=== 6. REGISTER SECOND STUDENT USING SUMITHRA'S REFERRAL LINK ===")
friend_email = f"aditya.friend.{ref_code.lower()}@example.edu"
status, student_2 = post("/api/register", {
    "name": "Aditya Kumar",
    "email": friend_email,
    "college_id": college_1["id"],
    "branch": "ECE",
    "year": "4th Year (2025)",
    "referral_code_used": ref_code
})
assert status == 200, f"Referred registration failed: {student_2}"
print(f" Registered friend Aditya using referral code {ref_code}!")

print("\n=== 7. VERIFY REFERRAL COUNTER INCREASED ===")
status, dash_after = get(f"/api/students/{ref_code}")
assert status == 200
assert dash_after["referrals_count"] == 1, f"Expected 1 referral, got {dash_after['referrals_count']}"
assert len(dash_after["recent_referrals"]) == 1
print(f" Verified: Sumithra's referrals increased from 0 -> {dash_after['referrals_count']}!")
print(f" Recent friend recorded: {dash_after['recent_referrals'][0]['name']} ({dash_after['recent_referrals'][0]['branch']})")

print("\n=== 8. TESTING ADMIN AUTH & METRICS ===")
status, auth_res = post("/api/admin/login", {"username": "admin", "password": "admin123"})
assert status == 200 and auth_res["authenticated"] is True
print(f" Admin authentication passed for: {auth_res['name']}")

status, metrics = get("/api/admin/metrics")
assert status == 200
print(f" Total registrations in campaign: {metrics['total_registrations']} / {metrics['target_registrations']}")
print(f" Viral coefficient (K-factor): {metrics['viral_coefficient']}")
print(f" Branches participating: {[b['branch'] + ': ' + str(b['count']) for b in metrics['branch_distribution']]}")
print(f" Funnel Steps: {[f['step'] + ' (' + str(f['count']) + ')' for f in metrics['funnel']]}")

print("\nALL GROWTH PROTOTYPE SYSTEM CHECKS PASSED PERFECTLY!")
