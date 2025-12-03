// Configuration
const API_BASE = 'http://localhost:5000/api';

// Safely read and parse stored user/auth from localStorage
function safeParseJSON(value, fallback = null) {
    if (!value || value === 'undefined' || value === 'null') return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

let accessToken = localStorage.getItem('accessToken') || null;
let refreshToken = localStorage.getItem('refreshToken') || null;
let currentUser = safeParseJSON(localStorage.getItem('user'), null);
let currentQuizData = null;
let quizAnswers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAuthStatus();
    setupTabNavigation();
    setupEnterKeyListeners();
    const savedTab = localStorage.getItem('activeTab') || 'auth';
    showTab(savedTab);
});

// Tab Navigation
function showTab(tabId = 'auth') {
    const target = document.getElementById(tabId);
    if (!target) return;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    localStorage.setItem('activeTab', tabId);
}

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const tabId = btn.dataset.tab;
            showTab(tabId);
        });
    });
}

// Enter key listeners
function setupEnterKeyListeners() {
    document.getElementById('searchQuery').addEventListener('keypress', e => {
        if (e.key === 'Enter') search();
    });
}

// API Helper with automatic token refresh
async function apiCall(endpoint, options = {}, retry = true) {
    try {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        // Attach access token if available
        if (accessToken && !options.skipAuth) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, config);

        // If unauthorized and we have a refresh token, try to refresh once
        if (
            response.status === 401 &&
            !options.skipAuth &&
            refreshToken &&
            retry
        ) {
            try {
                const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    if (refreshData.data && refreshData.data.accessToken) {
                        // Update tokens in memory and localStorage
                        accessToken = refreshData.data.accessToken;
                        localStorage.setItem('accessToken', accessToken);
                        // Retry original request once with new token
                        return await apiCall(endpoint, options, false);
                    }
                } else {
                    // Refresh failed, clear auth state
                    accessToken = null;
                    refreshToken = null;
                    currentUser = null;
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    updateAuthStatus();
                }
            } catch (e) {
                // Ignore refresh errors and fall through to normal handling
            }
        }

        // Try to parse JSON response (backend always returns JSON)
        const data = await response.json().catch(() => ({}));

        showResponse(data);

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        showResponse({ error: error.message });
        throw error;
    }
}

// Update Auth Status
function updateAuthStatus() {
    const statusEl = document.getElementById('userStatus');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        statusEl.textContent = `${currentUser.name} (${currentUser.role})`;
        logoutBtn.style.display = 'block';
    } else {
        statusEl.textContent = 'Not Logged In';
        logoutBtn.style.display = 'none';
    }
}

// Show Response
function showResponse(data) {
    document.getElementById('response').textContent = JSON.stringify(data, null, 2);
}

function clearResponse() {
    document.getElementById('response').textContent = '';
}

// ==================== AUTH ====================

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        skipAuth: true,
    });

    let message = '✅ Signup successful! ';
    if (data.data && data.data.verificationOTP) {
        message += `\n\n📧 6-Digit OTP (for testing):\n${data.data.verificationOTP}\n\nEnter this OTP to verify your email.`;
        // Auto-fill the verification OTP field
        document.getElementById('verifyOTP').value = data.data.verificationOTP;
    } else {
        message += 'Check your email for the 6-digit OTP code.';
    }
    
    alert(message);
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });

    if (data.data) {
        accessToken = data.data.accessToken;
        refreshToken = data.data.refreshToken;
        currentUser = data.data.user;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(currentUser));

        updateAuthStatus();
        alert('Login successful!');
    }
}

async function verifyEmail() {
    const otp = document.getElementById('verifyOTP').value;
    
    if (!otp || !/^\d{6}$/.test(otp)) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    const data = await apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ otp }),
        skipAuth: true,
    });
    
    alert('✅ Email verified successfully! You can now login.');
    document.getElementById('verifyOTP').value = '';
}

async function resendOTP() {
    const email = document.getElementById('signupEmail').value || document.getElementById('loginEmail').value;
    
    if (!email) {
        alert('Please enter your email address first');
        return;
    }
    
    await apiCall('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
    });
    
    alert('✅ New OTP sent to your email!');
}

async function forgotPassword() {
    const email = document.getElementById('forgotEmail').value;
    await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
    });
    alert('Password reset email sent!');
}

document.getElementById('logoutBtn').onclick = async function() {
    try {
        await apiCall('/auth/logout', { method: 'POST' });
    } catch (e) {
        // Ignore errors
    }

    accessToken = null;
    refreshToken = null;
    currentUser = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    updateAuthStatus();
    alert('Logged out successfully!');
};

// ==================== PROFILE ====================

async function getMyProfile() {
    // Use auth/me endpoint which returns { data: { user } }
    const data = await apiCall('/auth/me');
    if (data.data && data.data.user) {
        const profile = data.data.user;
        document.getElementById('profileData').innerHTML = `
            <div class="data-item">
                <h4>${profile.name}</h4>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Role:</strong> ${profile.role}</p>
                <p><strong>Reputation:</strong> ${profile.reputationScore}</p>
                <p><strong>Notes Created:</strong> ${profile.notesCreated}</p>
                <p><strong>Quizzes Taken:</strong> ${profile.quizzesTaken}</p>
                ${profile.bio ? `<p><strong>Bio:</strong> ${profile.bio}</p>` : ''}
            </div>
        `;
    }
}

async function updateProfile() {
    const name = document.getElementById('updateName').value;
    const bio = document.getElementById('updateBio').value;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    // Use auth/me equivalent for profile update (user-owned fields)
    await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });

    alert('Profile updated!');
    getMyProfile();
}

// ==================== COURSES ====================

async function getLevels() {
    const data = await apiCall('/levels');
    if (data.data) {
        displayDataList('coursesData', data.data, item => `
            <div class="data-item">
                <h4>${item.name}</h4>
                <p><strong>Code:</strong> ${item.code}</p>
                <p>${item.description}</p>
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

async function getCourses() {
    const data = await apiCall('/courses');
    if (data.data) {
        displayDataList('coursesData', data.data, item => `
            <div class="data-item">
                <h4>${item.code} - ${item.title}</h4>
                <p>${item.description}</p>
                <p><strong>Department:</strong> ${item.department}</p>
                <p><strong>Credit Units:</strong> ${item.creditUnits}</p>
                <p><strong>Semester:</strong> ${item.semester}</p>
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

// ==================== RESOURCES ====================

function togglePastQuestionFields() {
    const resourceType = document.getElementById('resourceType').value;
    const pastQuestionFields = document.getElementById('pastQuestionFields');
    
    if (resourceType === 'past-question') {
        pastQuestionFields.style.display = 'block';
        // Make fields required
        document.getElementById('pastQuestionType').required = true;
        document.getElementById('pastQuestionYear').required = true;
        document.getElementById('pastQuestionSemester').required = true;
    } else {
        pastQuestionFields.style.display = 'none';
        // Remove required attribute
        document.getElementById('pastQuestionType').required = false;
        document.getElementById('pastQuestionYear').required = false;
        document.getElementById('pastQuestionSemester').required = false;
    }
}

async function uploadResource() {
    const type = document.getElementById('resourceType').value;
    const file = document.getElementById('fileInput').files[0];
    const title = document.getElementById('resourceTitle').value;
    const courseId = document.getElementById('resourceCourseId').value;

    if (!file || !title || !courseId) {
        alert('Please fill all fields and select a file');
        return;
    }

    // Step 1: Get presigned URL
    const urlData = await apiCall('/upload/presigned-url', {
        method: 'POST',
        body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
        }),
    });

    if (!urlData.data) return;

    // Step 2: Upload to R2
    const uploadResponse = await fetch(urlData.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });

    if (!uploadResponse.ok) {
        alert('File upload failed');
        return;
    }

    // Step 3: Create resource record
    const endpoint = type === 'past-question' ? '/past-questions' : '/official-notes';
    const resourceData = {
        course: courseId,
        title,
        fileKey: urlData.data.fileKey,
        fileUrl: urlData.data.downloadUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
    };

    if (type === 'past-question') {
        const pqType = document.getElementById('pastQuestionType').value;
        const year = parseInt(document.getElementById('pastQuestionYear').value);
        const semester = document.getElementById('pastQuestionSemester').value;
        
        if (!pqType || !year || !semester) {
            alert('Please fill all past question fields (Type, Year, Semester)');
            return;
        }
        
        resourceData.type = pqType;
        resourceData.year = year;
        resourceData.semester = semester;
    } else {
        resourceData.category = 'Lecture Notes';
    }

    await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(resourceData),
    });

    alert('Resource uploaded successfully!');
}

async function getPastQuestions() {
    const data = await apiCall('/past-questions');
    if (data.data && data.data.pastQuestions) {
        displayDataList('resourcesData', data.data.pastQuestions, item => {
            const typeLabels = {
                'past-exam': '📝 Past Exam',
                'past-mid-semester': '📋 Past Mid Semester',
                'past-quiz': '📊 Past Quiz',
                'past-assignment': '📄 Past Assignment',
                'past-class-work': '✏️ Past Class Work',
                'past-group-project': '👥 Past Group Project',
                'past-project': '💼 Past Project'
            };
            const typeLabel = typeLabels[item.type] || item.type;
            return `
                <div class="data-item">
                    <h4>${item.title}</h4>
                    <p><strong>Type:</strong> ${typeLabel} | <strong>Year:</strong> ${item.year} | <strong>Semester:</strong> ${item.semester}</p>
                    <p><strong>Course:</strong> ${item.course ? item.course.code : 'N/A'}</p>
                    <p><strong>Downloads:</strong> ${item.downloadCount}</p>
                    <p><strong>ID:</strong> <code>${item._id}</code></p>
                </div>
            `;
        });
    } else if (data.data && Array.isArray(data.data)) {
        // Fallback for old response format
        displayDataList('resourcesData', data.data, item => {
            const typeLabels = {
                'past-exam': '📝 Past Exam',
                'past-mid-semester': '📋 Past Mid Semester',
                'past-quiz': '📊 Past Quiz',
                'past-assignment': '📄 Past Assignment',
                'past-class-work': '✏️ Past Class Work',
                'past-group-project': '👥 Past Group Project',
                'past-project': '💼 Past Project'
            };
            const typeLabel = typeLabels[item.type] || item.type || 'N/A';
            return `
                <div class="data-item">
                    <h4>${item.title}</h4>
                    <p><strong>Type:</strong> ${typeLabel} | <strong>Year:</strong> ${item.year} | <strong>Semester:</strong> ${item.semester}</p>
                    <p><strong>Downloads:</strong> ${item.downloadCount}</p>
                    <p><strong>ID:</strong> <code>${item._id}</code></p>
                </div>
            `;
        });
    }
}

async function getOfficialNotes() {
    const data = await apiCall('/official-notes');
    if (data.data) {
        displayDataList('resourcesData', data.data, item => `
            <div class="data-item">
                <h4>${item.title}</h4>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Downloads:</strong> ${item.downloadCount}</p>
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

// ==================== NOTES ====================

async function createNote() {
    const title = document.getElementById('noteTitle').value;
    const courseId = document.getElementById('noteCourseId').value;
    const content = document.getElementById('noteContent').value;

    if (!title || !courseId || !content) {
        alert('Please fill in all fields');
        return;
    }

    await apiCall('/community-notes', {
        method: 'POST',
        body: JSON.stringify({
            course: courseId, // API expects 'course' not 'courseId'
            title,
            content,
        }),
    });

    alert('Note created successfully!');
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteCourseId').value = '';
    document.getElementById('noteContent').value = '';
    
    // Refresh my notes
    setTimeout(() => getMyNotes(), 500);
}

async function getNotes() {
    const sortBy = document.getElementById('notesSortBy')?.value || 'recent';
    const data = await apiCall(`/community-notes?sortBy=${sortBy}`);
    const notes = data.data?.communityNotes || data.data || [];
    if (notes.length > 0 || Array.isArray(notes)) {
        displayDataList('notesData', notes, item => `
            <div class="data-item">
                <h4>${item.title} ${item.isPinned ? '📌' : ''}</h4>
                <p>${item.content ? item.content.substring(0, 150) + '...' : 'No content'}</p>
                <p>
                    <span class="badge" style="background: #10b981;">👍 ${item.upvotes || 0}</span>
                    <span class="badge" style="background: #ef4444;">👎 ${item.downvotes || 0}</span>
                    <span class="badge" style="background: #6366f1;">💬 ${item.commentCount || 0}</span>
                    <span class="badge" style="background: #f59e0b;">⭐ ${item.score || 0}</span>
                </p>
                ${item.author ? `<p><strong>Author:</strong> ${item.author.name || 'Unknown'}</p>` : ''}
                ${item.course ? `<p><strong>Course:</strong> ${item.course.code || ''} - ${item.course.title || ''}</p>` : ''}
                <p><strong>ID:</strong> <code>${item._id}</code></p>
                <button onclick="document.getElementById('voteNoteId').value='${item._id}'; document.getElementById('viewNoteId').value='${item._id}'" style="width: auto; padding: 6px 12px; margin-top: 5px;">Use This Note</button>
            </div>
        `);
    }
}

async function getMyNotes() {
    const data = await apiCall('/community-notes/me');
    const notes = data.data?.communityNotes || data.data || [];
    if (notes.length > 0 || Array.isArray(notes)) {
        displayDataList('myNotesData', notes, item => `
            <div class="data-item">
                <h4>${item.title}</h4>
                <p>${item.content ? item.content.substring(0, 100) + '...' : 'No content'}</p>
                <p>
                    <span class="badge">👍 ${item.upvotes || 0}</span>
                    <span class="badge">👎 ${item.downvotes || 0}</span>
                    <span class="badge">💬 ${item.commentCount || 0}</span>
                    <span class="badge">⭐ Score: ${item.score || 0}</span>
                </p>
                ${item.course ? `<p><strong>Course:</strong> ${item.course.code || ''}</p>` : ''}
                <p><strong>ID:</strong> <code>${item._id}</code></p>
                <div style="margin-top: 10px;">
                    <button onclick="editNote('${item._id}')" style="width: auto; padding: 6px 12px; margin-right: 5px;">Edit</button>
                    <button onclick="deleteNote('${item._id}')" style="width: auto; padding: 6px 12px; background: #ef4444;">Delete</button>
                </div>
            </div>
        `);
    } else {
        document.getElementById('myNotesData').innerHTML = '<p class="loading">No notes found. Create your first note!</p>';
    }
}

async function viewNoteDetails() {
    const noteId = document.getElementById('viewNoteId').value;
    if (!noteId) {
        alert('Please enter a Note ID');
        return;
    }
    
    const data = await apiCall(`/community-notes/${noteId}`);
    const note = data.data?.communityNote || data.data || null;
    if (note) {
        document.getElementById('noteDetails').innerHTML = `
            <div class="data-item" style="margin-top: 15px;">
                <h4>${note.title} ${note.isPinned ? '📌 Pinned' : ''}</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                    ${note.content || 'No content'}
                </div>
                <p>
                    <span class="badge" style="background: #10b981;">👍 ${note.upvotes || 0} Upvotes</span>
                    <span class="badge" style="background: #ef4444;">👎 ${note.downvotes || 0} Downvotes</span>
                    <span class="badge" style="background: #6366f1;">💬 ${note.commentCount || 0} Comments</span>
                    <span class="badge" style="background: #f59e0b;">⭐ Score: ${note.score || 0}</span>
                </p>
                ${note.author ? `<p><strong>Author:</strong> ${note.author.name || 'Unknown'} (${note.author.email || ''})</p>` : ''}
                ${note.course ? `<p><strong>Course:</strong> ${note.course.code || ''} - ${note.course.title || ''}</p>` : ''}
                <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
                <p><strong>ID:</strong> <code>${note._id}</code></p>
            </div>
        `;
        
        // Auto-fill vote field
        document.getElementById('voteNoteId').value = noteId;
        document.getElementById('commentNoteId').value = noteId;
    }
}

async function addComment() {
    const noteId = document.getElementById('commentNoteId').value;
    const content = document.getElementById('commentContent').value;

    if (!noteId || !content) {
        alert('Please enter both Note ID and comment');
        return;
    }

    await apiCall(`/comments/note/${noteId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });

    alert('Comment added!');
    document.getElementById('commentContent').value = '';
    
    // Refresh comments
    setTimeout(() => getComments(), 500);
}

async function upvoteNote() {
    const noteId = document.getElementById('voteNoteId').value || document.getElementById('commentNoteId').value;
    if (!noteId) {
        alert('Please enter a Note ID');
        return;
    }
    
    const data = await apiCall('/votes', {
        method: 'POST',
        body: JSON.stringify({
            entityType: 'note',
            entityId: noteId,
            voteType: 'upvote',
        }),
    });
    
    document.getElementById('voteInfo').innerHTML = `
        <div class="success" style="margin-top: 10px;">
            ✅ ${data.message || 'Upvoted successfully!'}
        </div>
    `;
    
    // Refresh vote counts
    setTimeout(() => getVoteCounts(), 500);
}

async function downvoteNote() {
    const noteId = document.getElementById('voteNoteId').value || document.getElementById('commentNoteId').value;
    if (!noteId) {
        alert('Please enter a Note ID');
        return;
    }
    
    const data = await apiCall('/votes', {
        method: 'POST',
        body: JSON.stringify({
            entityType: 'note',
            entityId: noteId,
            voteType: 'downvote',
        }),
    });
    
    document.getElementById('voteInfo').innerHTML = `
        <div class="success" style="margin-top: 10px;">
            ✅ ${data.message || 'Downvoted successfully!'}
        </div>
    `;
    
    // Refresh vote counts
    setTimeout(() => getVoteCounts(), 500);
}

async function getVoteCounts() {
    const noteId = document.getElementById('voteNoteId').value || document.getElementById('commentNoteId').value;
    if (!noteId) {
        alert('Please enter a Note ID');
        return;
    }
    
    const data = await apiCall(`/votes/counts?entityType=note&entityId=${noteId}`);
    if (data.data) {
        document.getElementById('voteInfo').innerHTML = `
            <div class="data-item" style="margin-top: 10px;">
                <h4>Vote Statistics</h4>
                <p><strong>👍 Upvotes:</strong> ${data.data.upvotes || 0}</p>
                <p><strong>👎 Downvotes:</strong> ${data.data.downvotes || 0}</p>
                <p><strong>📊 Net Score:</strong> ${data.data.score || 0}</p>
            </div>
        `;
    }
}

async function getComments() {
    const noteId = document.getElementById('commentNoteId').value;
    if (!noteId) {
        alert('Please enter a Note ID');
        return;
    }
    
    const data = await apiCall(`/comments/note/${noteId}`);
    const comments = data.data || [];
    if (comments.length > 0 || Array.isArray(comments)) {
        displayDataList('commentsData', comments, item => {
            const userName = item.userId?.name || item.user?.name || item.userId?.email || 'Anonymous';
            return `
            <div class="data-item">
                <p><strong>${userName}:</strong> ${item.content}</p>
                <p style="color: #666; font-size: 12px;">${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
            </div>
        `;
        });
    }
}

async function editNote(noteId) {
    const title = prompt('Enter new title (or leave empty to keep current):');
    const content = prompt('Enter new content (or leave empty to keep current):');
    
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    
    if (Object.keys(updateData).length === 0) {
        alert('No changes made');
        return;
    }
    
    await apiCall(`/community-notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
    });
    
    alert('Note updated!');
    getMyNotes();
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    await apiCall(`/community-notes/${noteId}`, {
        method: 'DELETE',
    });
    
    alert('Note deleted!');
    getMyNotes();
}

// ==================== QUIZZES ====================

async function createQuiz() {
    const title = document.getElementById('quizTitle').value;
    const courseId = document.getElementById('quizCourseId').value;
    const description = document.getElementById('quizDescription').value;

    // Sample quiz with 2 questions
    const quizData = {
        course: courseId,
        title,
        description,
        questions: [
            {
                questionText: "What is 2 + 2?",
                options: [
                    { text: "3", isCorrect: false },
                    { text: "4", isCorrect: true },
                    { text: "5", isCorrect: false },
                ],
                explanation: "2 + 2 = 4",
                points: 1,
            },
            {
                questionText: "What is the capital of France?",
                options: [
                    { text: "London", isCorrect: false },
                    { text: "Berlin", isCorrect: false },
                    { text: "Paris", isCorrect: true },
                    { text: "Madrid", isCorrect: false },
                ],
                explanation: "Paris is the capital of France",
                points: 1,
            },
        ],
        timeLimit: 30,
        passingScore: 50,
        difficulty: "Easy",
        isPublished: true,
    };

    await apiCall('/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData),
    });

    alert('Quiz created!');
}

async function getQuizzes() {
    const data = await apiCall('/quizzes');
    if (data.data) {
        displayDataList('quizzesData', data.data, item => `
            <div class="data-item">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p><strong>Difficulty:</strong> ${item.difficulty}</p>
                <p><strong>Questions:</strong> ${item.questions?.length || 0}</p>
                <p><strong>Attempts:</strong> ${item.attemptsCount}</p>
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

async function loadQuiz() {
    const quizId = document.getElementById('takeQuizId').value;
    const data = await apiCall(`/quizzes/${quizId}?attempting=true`);

    if (data.data) {
        currentQuizData = data.data;
        quizAnswers = [];
        
        let html = `<h4>${currentQuizData.title}</h4>`;
        html += `<p>${currentQuizData.description}</p><hr>`;

        currentQuizData.questions.forEach((q, qIndex) => {
            html += `
                <div class="quiz-question">
                    <h4>Question ${qIndex + 1}: ${q.questionText}</h4>
                    ${q.options.map((opt, optIndex) => `
                        <div class="quiz-option">
                            <input type="radio" 
                                   name="q${qIndex}" 
                                   value="${optIndex}"
                                   onchange="selectAnswer('${q._id}', ${optIndex})">
                            <label>${opt.text}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        });

        document.getElementById('quizContent').innerHTML = html;
        document.getElementById('submitQuizBtn').style.display = 'block';
    }
}

function selectAnswer(questionId, optionIndex) {
    const existingIndex = quizAnswers.findIndex(a => a.questionId === questionId);
    if (existingIndex >= 0) {
        quizAnswers[existingIndex].selectedOptionIndex = optionIndex;
    } else {
        quizAnswers.push({ questionId, selectedOptionIndex: optionIndex });
    }
}

async function submitQuiz() {
    if (quizAnswers.length !== currentQuizData.questions.length) {
        alert('Please answer all questions');
        return;
    }

    const quizId = document.getElementById('takeQuizId').value;
    const data = await apiCall(`/quizzes/${quizId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({
            answers: quizAnswers,
            timeSpent: 120, // 2 minutes
        }),
    });

    if (data.data) {
        alert(`Quiz submitted! Score: ${data.data.score}% - ${data.data.isPassed ? 'PASSED' : 'FAILED'}`);
        document.getElementById('quizContent').innerHTML = '';
        document.getElementById('submitQuizBtn').style.display = 'none';
    }
}

// ==================== REQUESTS ====================

async function createRequest() {
    const title = document.getElementById('requestTitle').value;
    const courseId = document.getElementById('requestCourseId').value;
    const type = document.getElementById('requestType').value;
    const description = document.getElementById('requestDescription').value;

    await apiCall('/requests', {
        method: 'POST',
        body: JSON.stringify({
            course: courseId,
            requestType: type,
            title,
            description,
        }),
    });

    alert('Request created!');
}

async function getRequests() {
    const data = await apiCall('/requests');
    if (data.data) {
        displayDataList('requestsData', data.data, item => `
            <div class="data-item">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <p>
                    <span class="badge">${item.requestType}</span>
                    <span class="badge">${item.status}</span>
                </p>
                <p><strong>Priority:</strong> ${item.priority} (👍 ${item.upvotes} 👎 ${item.downvotes})</p>
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

// ==================== LEADERBOARD ====================

async function getLeaderboard() {
    const data = await apiCall('/leaderboard');
    if (data.data) {
        displayDataList('leaderboardData', data.data, (item, index) => `
            <div class="data-item">
                <h4>#${item.rank} ${item.name}</h4>
                <p><strong>Reputation:</strong> ${item.reputationScore}</p>
                <p><strong>Notes:</strong> ${item.notesCreated} | <strong>Quizzes:</strong> ${item.quizzesTaken}</p>
                <span class="badge">${item.role}</span>
            </div>
        `);
    }
}

async function getMyPosition() {
    const data = await apiCall('/leaderboard/me');
    if (data.data) {
        const pos = data.data;
        document.getElementById('positionData').innerHTML = `
            <div class="data-item">
                <h4>Your Rankings</h4>
                <p><strong>Global Rank:</strong> #${pos.globalRank} of ${pos.totalUsers}</p>
                <p><strong>Role Rank:</strong> #${pos.roleRank} of ${pos.totalRoleUsers}</p>
                <p><strong>Percentile:</strong> Top ${100 - pos.percentile}%</p>
                <p><strong>Reputation:</strong> ${pos.user.reputationScore}</p>
            </div>
        `;
    }
}

async function getTopContributors() {
    const data = await apiCall('/leaderboard/top-contributors?limit=10');
    if (data.data) {
        displayDataList('contributorsData', data.data, item => `
            <div class="data-item">
                <h4>#${item.rank} ${item.name}</h4>
                <p><strong>Notes Created:</strong> ${item.notesCreated}</p>
                <p><strong>Reputation:</strong> ${item.reputationScore}</p>
            </div>
        `);
    }
}

async function getQuizChampions() {
    const data = await apiCall('/leaderboard/quiz-champions?limit=10');
    if (data.data) {
        displayDataList('championsData', data.data, item => `
            <div class="data-item">
                <h4>#${item.rank} ${item.name}</h4>
                <p><strong>Correct Answers:</strong> ${item.quizCorrectAnswers}</p>
                <p><strong>Quizzes Taken:</strong> ${item.quizzesTaken}</p>
                <p><strong>Accuracy:</strong> ${item.accuracy}%</p>
            </div>
        `);
    }
}

// ==================== SEARCH ====================

async function search() {
    const query = document.getElementById('searchQuery').value;
    const type = document.getElementById('searchType').value;

    if (!query || query.length < 2) {
        alert('Please enter at least 2 characters');
        return;
    }

    let endpoint = `/search?q=${encodeURIComponent(query)}`;
    if (type !== 'global') {
        endpoint = `/search/${type}?q=${encodeURIComponent(query)}`;
    }

    const data = await apiCall(endpoint, { skipAuth: true });
    if (data.data) {
        displayDataList('searchResults', data.data, item => `
            <div class="data-item">
                <h4>${item.title || item.name || item.code}</h4>
                ${item.type ? `<span class="badge">${item.type}</span>` : ''}
                ${item.description ? `<p>${item.description.substring(0, 100)}...</p>` : ''}
                ${item.content ? `<p>${item.content.substring(0, 100)}...</p>` : ''}
                <p><strong>ID:</strong> <code>${item._id}</code></p>
            </div>
        `);
    }
}

async function getSuggestions() {
    const query = document.getElementById('suggestQuery').value;
    const data = await apiCall(`/search/suggestions?q=${encodeURIComponent(query)}`, { skipAuth: true });
    
    if (data.data) {
        document.getElementById('suggestionsData').innerHTML = data.data.map(item => `
            <div class="data-item">
                <p><strong>${item.text}</strong></p>
                <span class="badge">${item.type}</span>
            </div>
        `).join('');
    }
}

// ==================== UTILITIES ====================

function displayDataList(elementId, items, template) {
    const container = document.getElementById(elementId);
    if (items.length === 0) {
        container.innerHTML = '<p class="loading">No items found</p>';
        return;
    }
    container.innerHTML = items.map((item, index) => template(item, index)).join('');
}

