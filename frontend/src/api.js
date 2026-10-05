const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function fetchColleges() {
  const res = await fetch(`${API_BASE_URL}/api/colleges`);
  if (!res.ok) throw new Error('Failed to load colleges');
  return res.json();
}

export async function fetchCollegeDetails(collegeId) {
  const res = await fetch(`${API_BASE_URL}/api/colleges/${collegeId}`);
  if (!res.ok) throw new Error('Failed to load college details');
  return res.json();
}

export async function updateCollege(collegeId, data) {
  const res = await fetch(`${API_BASE_URL}/api/colleges/${collegeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update college');
  return res.json();
}

export async function addCollege(data) {
  const res = await fetch(`${API_BASE_URL}/api/colleges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to add college');
  }
  return res.json();
}

export async function fetchQuizQuestions() {
  const res = await fetch(`${API_BASE_URL}/api/quiz/questions`);
  if (!res.ok) throw new Error('Failed to load quiz');
  return res.json();
}

export async function submitQuiz(answers, sessionId) {
  const res = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, session_id: sessionId }),
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return res.json();
}

export async function registerStudent(formData) {
  const res = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function fetchStudentDashboard(identifier) {
  const res = await fetch(`${API_BASE_URL}/api/students/${identifier}`);
  if (!res.ok) throw new Error('Failed to fetch student dashboard');
  return res.json();
}

export async function fetchCollegeLeaderboard(sortBy = 'registrations') {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard/colleges?sort_by=${sortBy}`);
  if (!res.ok) throw new Error('Failed to load college leaderboard');
  return res.json();
}

export async function fetchChampionsLeaderboard(limit = 15) {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard/champions?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load champions leaderboard');
  return res.json();
}

export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Admin login failed');
  }
  return res.json();
}

export async function fetchAdminMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/admin/metrics`);
  if (!res.ok) throw new Error('Failed to load admin metrics');
  return res.json();
}

export async function fetchAdminRegistrations(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.college_id) query.append('college_id', params.college_id);
  if (params.branch) query.append('branch', params.branch);
  if (params.year) query.append('year', params.year);
  if (params.is_suspicious !== undefined && params.is_suspicious !== '') {
    query.append('is_suspicious', params.is_suspicious);
  }
  query.append('limit', params.limit || 100);
  query.append('offset', params.offset || 0);

  const res = await fetch(`${API_BASE_URL}/api/admin/registrations?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load registrations');
  return res.json();
}

export async function toggleSuspiciousRegistration(userId) {
  const res = await fetch(`${API_BASE_URL}/api/admin/registrations/${userId}/toggle-suspicious`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchExperiments() {
  const res = await fetch(`${API_BASE_URL}/api/admin/experiments`);
  if (!res.ok) throw new Error('Failed to load experiments');
  return res.json();
}

export async function createExperiment(expData) {
  const res = await fetch(`${API_BASE_URL}/api/admin/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expData),
  });
  if (!res.ok) throw new Error('Failed to create experiment');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE_URL}/api/admin/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}

export async function trackFunnel(eventType, metadata = {}) {
  try {
    let sessionId = localStorage.getItem('nxt_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('nxt_session_id', sessionId);
    }
    await fetch(`${API_BASE_URL}/api/funnel/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionId,
        metadata
      }),
    });
  } catch (e) {
    // Non-blocking tracking
  }
}
