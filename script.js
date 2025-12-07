// ---------- CONFIG & INIT ----------
const firebaseConfig = {
  apiKey: "AIzaSyA_M3X9VxAOH0jKy799avu09BPA480WHpA",
  authDomain: "hcmue-a95cd.firebaseapp.com",
  projectId: "hcmue-a95cd",
  storageBucket: "hcmue-a95cd.firebasestorage.app",
  messagingSenderId: "847360348342",
  appId: "1:847360348342:web:d16d48c63511cd613c1617",
  measurementId: "G-BRN1DZ4WWX"
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized.");
} catch (err) {
  console.error("Firebase init failed:", err);
  alert("Lỗi khởi tạo Firebase — kiểm tra console.");
}

const auth = firebase.auth();
const db = firebase.firestore();

// ---------- UTIL ----------
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }
function generateAccessCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({length:3}, () => Array.from({length:3}, () => chars.charAt(Math.floor(Math.random()*chars.length))).join('')).join('-');
}
function showMsg(el, text, cls='') {
  if (!el) return;
  el.textContent = text;
  el.className = cls;
}

// ---------- AUTH (login/signup/logout) ----------
function initAuth() {
  const authForm = $('#auth-form');
  const loginBtn = $('#login-btn');
  const authMessage = $('#auth-message');
  const userActions = $('#user-actions');
  const logoutBtn = $('#logout-btn');

  if (!authForm) return;

  auth.onAuthStateChanged(user => {
    if (user) {
      userActions && (userActions.style.display = 'block');
      document.querySelector('.auth-card') && (document.querySelector('.auth-card').style.display = 'none');
      console.log('User logged in:', user.email);
    } else {
      userActions && (userActions.style.display = 'none');
      document.querySelector('.auth-card') && (document.querySelector('.auth-card').style.display = 'block');
      console.log('No user logged in.');
    }
  });

  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = (document.getElementById('email')?.value || '').trim();
    const password = document.getElementById('password')?.value || '';

    if (!email || !password) {
      showMsg(authMessage, 'Vui lòng nhập email và mật khẩu.', 'error');
      return;
    }

    auth.signInWithEmailAndPassword(email, password)
      .then(uc => showMsg(authMessage, 'Đăng nhập thành công!', 'success'))
      .catch(err => {
        console.error('Login error:', err);
        let msg = 'Lỗi: ' + (err.message || 'Không xác định.');
        if (err.code === 'auth/user-not-found') msg = 'Email chưa đăng ký.';
        if (err.code === 'auth/wrong-password') msg = 'Mật khẩu sai.';
        if (err.code === 'auth/invalid-email') msg = 'Email không hợp lệ.';
        showMsg(authMessage, msg, 'error');
      });
  });

  logoutBtn && logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => console.log('Logged out.'));
  });
}

// ---------- SIGNUP ----------
function initSignup() {
  const signupForm = $('#signup-form');
  const signupMessage = $('#signup-message');
  if (!signupForm) return;

  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = (document.getElementById('signup-email')?.value || '').trim();
    const password = document.getElementById('signup-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';

    if (!email || !password) {
      showMsg(signupMessage, 'Vui lòng nhập email và mật khẩu.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showMsg(signupMessage, 'Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(uc => {
        showMsg(signupMessage, 'Đăng ký thành công! Chuyển hướng...', 'success');
        setTimeout(() => window.location.href = 'index.html', 1200);
      })
      .catch(err => {
        console.error('Signup error:', err);
        let msg = 'Lỗi: ' + (err.message || 'Không xác định.');
        if (err.code === 'auth/email-already-in-use') msg = 'Email đã được sử dụng.';
        if (err.code === 'auth/weak-password') msg = 'Mật khẩu quá yếu (ít nhất 6 ký tự).';
        showMsg(signupMessage, msg, 'error');
      });
  });
}

// ---------- CREATE QUIZ UI HELPERS ----------
function createQuestionCardHTML() {
  return `
    <div class="question-card">
      <label>Câu Hỏi:
        <input type="text" class="question" required>
      </label>
      <label>Điểm:
        <input type="number" class="point" min="1" value="1" required>
      </label>
      <div class="answers">
        <div class="answer-item">
          <input type="text" class="answer" placeholder="Đáp Án 1" required>
          <button type="button" class="remove-answer" style="display:none;">×</button>
        </div>
        <div class="answer-item">
          <input type="text" class="answer" placeholder="Đáp Án 2" required>
          <button type="button" class="remove-answer" style="display:none;">×</button>
        </div>
      </div>
      <button type="button" class="add-answer btn">+ Thêm Đáp Án</button>
      <select class="correct-answer">
        <option value="0">Đáp Án Đúng: 1</option>
        <option value="1">Đáp Án Đúng: 2</option>
      </select>
    </div>
  `;
}

function attachCreateQuizHandlers() {
  const addQBtn = $('#add-question');
  const questionsContainer = $('#questions-container');
  const quizForm = $('#quiz-form');
  const quizMessage = $('#quiz-message');

  if (!quizForm) return;

  // Add initial question card if none
  if (questionsContainer && !questionsContainer.querySelector('.question-card')) {
    questionsContainer.insertAdjacentHTML('beforeend', createQuestionCardHTML());
  }

  // Delegated listener: add/remove answers and update correct options
  if (questionsContainer) {
    questionsContainer.addEventListener('click', (e) => {
      const target = e.target;

      // Add answer
      if (target.closest('.add-answer')) {
        const card = target.closest('.question-card');
        const answersDiv = card.querySelector('.answers');
        const count = answersDiv.querySelectorAll('.answer-item').length;
        if (count >= 4) return alert('Tối đa 4 đáp án!');
        const newIdx = count + 1;
        const item = document.createElement('div');
        item.className = 'answer-item';
        item.innerHTML = `<input type="text" class="answer" placeholder="Đáp Án ${newIdx}" required>
                          <button type="button" class="remove-answer">×</button>`;
        answersDiv.appendChild(item);
        updateCorrectOptions(card);
        return;
      }

      // Remove answer
      if (target.classList.contains('remove-answer')) {
        const card = target.closest('.question-card');
        const answersDiv = card.querySelector('.answers');
        const items = answersDiv.querySelectorAll('.answer-item');
        if (items.length <= 2) return alert('Phải có ít nhất 2 đáp án!');
        target.parentElement.remove();
        updateCorrectOptions(card);
        return;
      }
    });
  }

  // Add question button
  addQBtn && addQBtn.addEventListener('click', () => {
    questionsContainer.insertAdjacentHTML('beforeend', createQuestionCardHTML());
  });

  // Single submit handler (no duplicates)
  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveQuizFromForm();
  });

  // helper
  function updateCorrectOptions(card) {
    const answers = card.querySelectorAll('.answer-item');
    const select = card.querySelector('.correct-answer');
    if (!select) return;
    select.innerHTML = '';
    answers.forEach((_, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = Đáp Án Đúng: ${idx + 1};
      select.appendChild(opt);
    });
  }

  // Save quiz: validate then save to Firestore
  async function saveQuizFromForm() {
    const title = ($('#quiz-title')?.value || '').trim();
    const timeVal = parseInt($('#quiz-time')?.value || '0', 10);
    if (!title) { showMsg(quizMessage, 'Vui lòng nhập tiêu đề quiz.', 'error'); return; }
    if (!timeVal || isNaN(timeVal) || timeVal <= 0) { showMsg(quizMessage, 'Thời gian phải là số dương (phút).', 'error'); return; }

    const qCards = Array.from(questionsContainer.querySelectorAll('.question-card'));
    if (qCards.length === 0) { showMsg(quizMessage, 'Thêm ít nhất 1 câu hỏi.', 'error'); return; }

    // Build questions array with validation
    const questions = [];
    for (let i = 0; i < qCards.length; i++) {
      const c = qCards[i];
      const questionText = (c.querySelector('.question')?.value || '').trim();
      const point = parseInt(c.querySelector('.point')?.value || '1', 10);
      const answers = Array.from(c.querySelectorAll('.answer')).map(a => (a.value || '').trim()).filter(x => x !== '');
      const correct = parseInt(c.querySelector('.correct-answer')?.value || '0', 10);

      if (!questionText) { showMsg(quizMessage, Câu ${i+1}: nội dung câu hỏi trống., 'error'); return; }
      if (answers.length < 2) { showMsg(quizMessage, Câu ${i+1}: phải có ít nhất 2 đáp án., 'error'); return; }
      if (correct < 0 || correct >= answers.length) { showMsg(quizMessage, Câu ${i+1}: đáp án đúng không hợp lệ., 'error'); return; }

      questions.push({ question: questionText, point: point, answers: answers, correct: correct });
    }

    // Generate id + access code
    try {
      const quizId = db.collection('quizzes').doc().id;
      const accessCode = generateAccessCode();
      await db.collection('quizzes').doc(quizId).set({
        title,
        time: timeVal,
        questions,
        accessCode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showMsg(quizMessage, Tạo Quiz thành công! Mã truy cập: ${accessCode}, 'success');
      // Optional: reset form (uncomment if desired)
      // quizForm.reset();
      // questionsContainer.innerHTML = createQuestionCardHTML();
    } catch (err) {
      console.error('Save quiz error:', err);
      alert('Có lỗi khi lưu quiz. Kiểm tra console.');
    }
  }
}

// ---------- PLAY QUIZ (single implementation) ----------
function initPlayQuiz() {
  const uploadInput = $('#upload-json'); // optional: may not exist on play page
  const quizDisplay = $('#quiz-display');
  const uploadCard = $('#upload-card');
  const quizTitleEl = $('#quiz-title');
  const questionTextEl = $('#question-text');
  const answersEl = $('#answers');
  const nextBtn = $('#next-btn');
  const questionNav = $('#question-nav');
  const timeLeftEl = $('#time-left');
  const resultsEl = $('#results');

  // state
  let quiz = null;
  let currentQuestion = 0;
  let answersChosen = {}; // index -> chosen index
  let timer = null;
  let timeLeftSec = 0;

  // ---------------- JSON UPLOAD (optional) ----------------
  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          // minimal validation
          if (!parsed.title || !Array.isArray(parsed.questions) || typeof parsed.time !== 'number') {
            return alert('JSON không hợp lệ. Cần {title, time(number, phút), questions[]}');
          }
          quiz = parsed;
          startQuiz();
        } catch (err) {
          console.error('JSON parse error:', err);
          alert('Không đọc được file JSON.');
        }
      };
      reader.readAsText(file);
    });
  }

  // ---------- LOAD QUIZ BY ACCESS CODE ----------
  const accessInput = $('#access-code-input');
  const loadCodeBtn = $('#load-code-btn');
  const loadCodeMsg = $('#load-code-msg');

  if (loadCodeBtn) {
    loadCodeBtn.addEventListener('click', async () => {
      const code = (accessInput?.value || '').trim().toLowerCase();
      if (!code) {
        showMsg(loadCodeMsg, 'Vui lòng nhập mã truy cập.', 'error');
        return;
      }

      try {
        showMsg(loadCodeMsg, 'Đang tải...', '');

        const snap = await db.collection('quizzes')
          .where('accessCode', '==', code)
          .limit(1)
          .get();

        if (snap.empty) {
          showMsg(loadCodeMsg, 'Không tìm thấy quiz với mã này.', 'error');
          return;
        }

        quiz = snap.docs[0].data();

        if (!quiz || !quiz.title || !Array.isArray(quiz.questions) || typeof quiz.time !== 'number') {
          showMsg(loadCodeMsg, 'Quiz bị lỗi dữ liệu.', 'error');
          return;
        }

        showMsg(loadCodeMsg, 'Tải thành công! Bắt đầu...', 'success');

        startQuiz();
      } catch (err) {
        console.error('Load code error:', err);
        showMsg(loadCodeMsg, 'Lỗi khi tải quiz. Kiểm tra console.', 'error');
      }
    });
  }

  // start
  function startQuiz() {
    if (!quiz) return;
    uploadCard && (uploadCard.style.display = 'none');
    quizDisplay && (quizDisplay.style.display = 'block');
    if (quizTitleEl) quizTitleEl.textContent = quiz.title;
    currentQuestion = 0;
    answersChosen = {};
    buildNav();
    showQuestion();
    startTimer(quiz.time);
  }

  function buildNav() {
    if (!questionNav) return;
    questionNav.innerHTML = '';
    quiz.questions.forEach((_, i) => {
      const b = document.createElement('button');
      b.textContent = i + 1;
      b.className = (i === currentQuestion ? 'active' : '');
      b.addEventListener('click', () => {
        currentQuestion = i;
        showQuestion();
        updateNav();
      });
      questionNav.appendChild(b);
    });
  }

  function updateNav() {
    if (!questionNav) return;
    Array.from(questionNav.children).forEach((b, i) => {
      b.className = (i === currentQuestion ? 'active' : '');
    });
  }

  function showQuestion() {
    if (!questionTextEl || !answersEl) return;
    const q = quiz.questions[currentQuestion];
    questionTextEl.textContent = q.question;
    answersEl.innerHTML = '';
    q.answers.forEach((txt, i) => {
      const btn = document.createElement('button');
      btn.textContent = txt;
      btn.disabled = false;
      if (answersChosen[currentQuestion] === i) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        answersChosen[currentQuestion] = i;
        showQuestion(); // re-render to show selection
      });
      answersEl.appendChild(btn);
    });
    if (nextBtn) nextBtn.style.display = 'block';
    updateNav();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!quiz) return;
      if (currentQuestion < quiz.questions.length - 1) {
        currentQuestion++;
        showQuestion();
      } else {
        showResults();
      }
    });
  }

  function startTimer(minutes) {
    if (!timeLeftEl) return;
    clearInterval(timer);
    timeLeftSec = Math.max(0, Math.floor(minutes) * 60);
    timer = setInterval(() => {
      const mm = Math.floor(timeLeftSec / 60);
      const ss = timeLeftSec % 60;
      timeLeftEl.textContent = ${mm}:${ss.toString().padStart(2,'0')};
      if (timeLeftSec <= 0) {
        clearInterval(timer);
        showResults();
      }
      timeLeftSec--;
    }, 1000);
  }

  function showResults() {
    clearInterval(timer);
    quizDisplay && (quizDisplay.style.display = 'none');
    resultsEl && (resultsEl.style.display = 'block');

    let total = 0, gain = 0;
    const details = quiz.questions.map((q, i) => {
      total += q.point || 0;
      const chosenIdx = answersChosen[i];
      const chosenText = (chosenIdx == null) ? '(không chọn)' : q.answers[chosenIdx];
      const isCorrect = chosenIdx === q.correct;
      if (isCorrect) gain += q.point || 0;
      return {
        idx: i+1,
        q: q.question,
        chosen: chosenText,
        correct: q.answers[q.correct],
        isCorrect,
        point: q.point || 0
      };
    });

    if (!resultsEl) return;
    resultsEl.innerHTML = `
      <h2>Kết Quả</h2>
      <p>Bạn đạt <b>${gain}</b> / ${total} điểm</p>
      <h3>Chi tiết</h3>
      ${details.map(d => `
        <div class="result-item">
          <p><b>Câu ${d.idx}:</b> ${d.q}</p>
          <p>Đáp án của bạn: ${d.chosen}</p>
          <p style="color:${d.isCorrect ? 'green' : 'red'}">
            ${d.isCorrect ? '✓ Đúng' : '✗ Sai'} — (Đúng: ${d.correct})
          </p>
        </div>
      `).join('')}
    `;
  }
}

// ---------- BOOTSTRAP ----------
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initSignup();
  attachCreateQuizHandlers();
  initPlayQuiz();
});
Chị Cún Cute 😍
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chơi Quiz</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header class="hero-header">
        <h1><i class="fas fa-gamepad"></i> Chơi Quiz Trắc Nghiệm</h1>
        <nav>
            <a href="index.html" class="btn btn-link">
                <i class="fas fa-home"></i> Trang Chủ
            </a>
        </nav>
    </header>
    <main class="play-quiz">
        <div class="upload-card" id="upload-card">
            <label>
                Mã Truy Cập Quiz:
                <input type="text" id="access-code-input" placeholder="Nhập mã: abc-xyz-def">
            </label>
            <button id="load-code-btn" class="btn btn-info">
                <i class="fas fa-play"></i> Truy cập
            </button>
            <p id="load-code-msg" style="margin-top: 8px;"></p>
        </div>
        <div id="quiz-display" style="display: none;" class="quiz-card">
            <h2 id="quiz-title"></h2>
            <div id="timer" class="timer">
                <i class="fas fa-clock"></i>
                Thời Gian Còn Lại: <span id="time-left"></span>
            </div>
            <div id="question-nav" class="nav-buttons"></div>
            <div id="question-container" class="question-card">
                <p id="question-text"></p>
                <div id="answers"></div>
            </div>
            <button id="next-btn" class="btn btn-primary" style="display: none;">
                <i class="fas fa-arrow-right"></i> Tiếp Theo
            </button>
        </div>
        <!-- KẾT QUẢ -->
        <div id="results" style="display: none;" class="result-card">
            <h2><i class="fas fa-trophy"></i> Kết Quả</h2>
            <p id="score"></p>
        </div>
    </main>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>
    <script src="script.js"></script>
</body>
</html>
