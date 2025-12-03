// Firebase Config (Đã cập nhật với config của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyA_M3X9VxAOH0jKy799avu09BPA480WHpA",
  authDomain: "hcmue-a95cd.firebaseapp.com",
  projectId: "hcmue-a95cd",
  storageBucket: "hcmue-a95cd.appspot.com",
  messagingSenderId: "847360348342",
  appId: "1:847360348342:web:d16d48c63511cd613c1617"
};
// Khởi tạo Firebase (Thêm try-catch để tránh lỗi storage)
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Lỗi khởi tạo Firebase. Kiểm tra config!");
}
const auth = firebase.auth();
// Auth Logic for index.html (Login)
if (document.getElementById('auth-form')) {
    const form = document.getElementById('auth-form');
    const loginBtn = document.getElementById('login-btn');
    const message = document.getElementById('auth-message');
    const userActions = document.getElementById('user-actions');
    const logoutBtn = document.getElementById('logout-btn');
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("User logged in:", user.email);
            userActions.style.display = 'block';
            document.querySelector('.auth-card').style.display = 'none';
        } else {
            console.log("No user logged in.");
            userActions.style.display = 'none';
            document.querySelector('.auth-card').style.display = 'block';
        }
    });
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        console.log("Attempting login with:", email);
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Login successful:", userCredential.user.email);
                message.textContent = 'Đăng nhập thành công!';
                message.className = 'success';
            })
            .catch(err => {
                console.error("Login error:", err);
                let errorMsg = 'Lỗi không xác định.';
                if (err.code === 'auth/user-not-found') errorMsg = 'Email chưa đăng ký.';
                else if (err.code === 'auth/wrong-password') errorMsg = 'Mật khẩu sai.';
                else if (err.code === 'auth/invalid-email') errorMsg = 'Email không hợp lệ.';
                else errorMsg = err.message;
                message.textContent = 'Lỗi: ' + errorMsg;
                message.className = 'error';
            });
    });
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => console.log("Logged out."));
    });
}
// Signup Logic for signup.html
if (document.getElementById('signup-form')) {
    const form = document.getElementById('signup-form');
    const message = document.getElementById('signup-message');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (password !== confirmPassword) {
            message.textContent = 'Mật khẩu xác nhận không khớp!';
            message.className = 'error';
            return;
        }
        console.log("Attempting signup with:", email);
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Signup successful:", userCredential.user.email);
                message.textContent = 'Đăng ký thành công! Chuyển hướng...';
                message.className = 'success';
                setTimeout(() => window.location.href = 'index.html', 2000);
            })
            .catch(err => {
                console.error("Signup error:", err);
                let errorMsg = 'Lỗi không xác định.';
                if (err.code === 'auth/email-already-in-use') errorMsg = 'Email đã được sử dụng.';
                else if (err.code === 'auth/weak-password') errorMsg = 'Mật khẩu quá yếu (ít nhất 6 ký tự).';
                else errorMsg = err.message;
               message.textContent = 'Lỗi: ' + errorMsg;
                message.className = 'error';
            });
    });
}
// Create Quiz Logic (for create-quiz.html)
if (document.getElementById('quiz-form')) {
    const form = document.getElementById('quiz-form');
    const addQuestionBtn = document.getElementById('add-question');
    const questionsContainer = document.getElementById('questions-container');
    const message = document.getElementById('quiz-message');
    // Hàm tạo question card mới với 2 đáp án mặc định
    function createQuestionCard() {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <label><i class="fas fa-question"></i> Câu Hỏi: <input type="text" class="question" required></label>
            <div class="answers">
                <div class="answer-item">
                    <input type="text" class="answer" placeholder="Đáp Án 1 ✅" required>
                    <button type="button" class="remove-answer" style="display: none;"><i class="fas fa-times"></i></button>
                </div>
                <div class="answer-item">
                    <input type="text" class="answer" placeholder="Đáp Án 2 ✅" required>
                    <button type="button" class="remove-answer" style="display: none;"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <button type="button" class="add-answer btn btn-success"><i class="fas fa-plus"></i> Thêm Đáp Án</button>
            <select class="correct-answer">
                <option value="0">Đáp Án Đúng: 1</option>
                <option value="1">Đáp Án Đúng: 2</option>
            </select>
        `;
        return questionCard;
    }
    // Thêm câu hỏi mới
    addQuestionBtn.addEventListener('click', () => {
        console.log("Adding new question...");
        const newQuestion = createQuestionCard();
        questionsContainer.appendChild(newQuestion);
        attachAnswerEvents(newQuestion);  // Gắn sự kiện cho đáp án
        console.log("Question added successfully.");
    });
    // Gắn sự kiện cho đáp án (thêm/xóa)
    function attachAnswerEvents(questionCard) {
        const addAnswerBtn = questionCard.querySelector('.add-answer');
        const answersDiv = questionCard.querySelector('.answers');
        const correctSelect = questionCard.querySelector('.correct-answer');
        addAnswerBtn.addEventListener('click', () => {
            console.log("Adding new answer...");
            const answerCount = answersDiv.querySelectorAll('.answer-item').length;
            if (answerCount < 4) {  // Giới hạn tối đa 4 đáp án
                const newAnswerItem = document.createElement('div');
                newAnswerItem.className = 'answer-item';
                newAnswerItem.innerHTML = `
                    <input type="text" class="answer" placeholder="Đáp Án ${answerCount + 1} ✅" required>
                    <button type="button" class="remove-answer"><i class="fas fa-times"></i></button>
                `;
                answersDiv.appendChild(newAnswerItem);
                updateCorrectOptions(questionCard);
                attachRemoveEvent(newAnswerItem.querySelector('.remove-answer'), questionCard);
                console.log("Answer added successfully.");
            } else {
                alert("Tối đa 4 đáp án!");
            }
        });
        // Gắn sự kiện xóa cho các đáp án hiện tại
        answersDiv.querySelectorAll('.remove-answer').forEach(btn => attachRemoveEvent(btn, questionCard));
    }
    function attachRemoveEvent(btn, questionCard) {
        btn.addEventListener('click', () => {
            console.log("Removing answer...");
            const answersDiv = questionCard.querySelector('.answers');
            const answerItems = answersDiv.querySelectorAll('.answer-item');
            if (answerItems.length > 2) {  // Giữ ít nhất 2 đáp án
                btn.parentElement.remove();
                updateCorrectOptions(questionCard);
                console.log("Answer removed successfully.");
            } else {
                alert("Phải có ít nhất 2 đáp án!");
            }
        });
    }
    function updateCorrectOptions(questionCard) {
        const answersDiv = questionCard.querySelector('.answers');
        const answerCount = answersDiv.querySelectorAll('.answer-item').length;
        const correctSelect = questionCard.querySelector('.correct-answer');
        correctSelect.innerHTML = '';
        for (let i = 0; i < answerCount; i++) {
            correctSelect.innerHTML += `<option value="${i}">Đáp Án Đúng: ${i + 1}</option>`;
        }
    }
    // Gắn sự kiện cho question card đầu tiên
    attachAnswerEvents(questionsContainer.querySelector('.question-card'));
    // Submit form và tải JSON
    form.addEventListener('submit', e => {
        e.preventDefault();
        console.log("Submitting form...");
        const title = document.getElementById('quiz-title').value.trim();
        const time = parseInt(document.getElementById('quiz-time').value);
        const questions = Array.from(document.querySelectorAll('.question-card')).map(card => {
            const question = card.querySelector('.question').value.trim();
            const answers = Array.from(card.querySelectorAll('.answer')).map(input => input.value.trim()).filter(val => val);
            const correct = parseInt(card.querySelector('.correct-answer').value);
            if (!question || answers.length < 2) {
                message.textContent = 'Mỗi câu hỏi cần có nội dung và ít nhất 2 đáp án!';
                message.className = 'error';
                console.error("Validation failed: Missing question or answers.");
                return null;
            }
            return { question, answers, correct };
        }).filter(q => q !== null);
        if (!title || questions.length === 0) {
            message.textContent = 'Vui lòng nhập tiêu đề và ít nhất 1 câu hỏi!';
            message.className = 'error';
            console.error("Validation failed: Missing title or questions.");
            return;
        }
        const quiz = { title, time, questions };
        console.log("Quiz data:", quiz);
        const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz.json';
        a.click();
        message.textContent = 'Tệp JSON đã được tải thành công! Kiểm tra thư mục Downloads.';
        message.className = 'success';
        console.log("JSON downloaded successfully.");
    });
}
// Play Quiz Logic (for play-quiz.html)
if (document.getElementById('upload-json')) {
    const upload = document.getElementById('upload-json');
    const quizDisplay = document.getElementById('quiz-display');
    const results = document.getElementById('results');
    let quiz, currentQuestion = 0, score = 0, timer;
    upload.addEventListener('change', e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            quiz = JSON.parse(reader.result);
            displayQuiz();
            startTimer();
        };
        reader.readAsText(file);
    });
    function displayQuiz() {
        quizDisplay.style.display = 'block';
        document.getElementById('quiz-title').textContent = quiz.title;
        updateQuestionNav();
        showQuestion();
    }
    function updateQuestionNav() {
        const nav = document.getElementById('question-nav');
        nav.innerHTML = '';
        quiz.questions.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.textContent = i + 1;
            btn.classList.toggle('active', i === currentQuestion);
            btn.addEventListener('click', () => { currentQuestion = i; showQuestion(); updateQuestionNav(); });
            nav.appendChild(btn);
        });
    }
    function showQuestion() {
        const q = quiz.questions[currentQuestion];
        document.getElementById('question-text').textContent = q.question;
        const answersDiv = document.getElementById('answers');
        answersDiv.innerHTML = '';
        q.answers.forEach((answer, i) => {
            const btn = document.createElement('button');
            btn.textContent = answer;
            btn.addEventListener('click', () => checkAnswer(i));
            answersDiv.appendChild(btn);
        });
        document.getElementById('next-btn').style.display = 'none';
    }
    function checkAnswer(selected) {
        const q = quiz.questions[currentQuestion];
        const buttons = document.querySelectorAll('#answers button');
        buttons.forEach((btn, i) => {
            if (i === q.correct) btn.classList.add('correct');
           else if (i === selected && i !== q.correct) btn.classList.add('incorrect');
            else if (i === q.correct) btn.classList.add('correct-answer');
            btn.disabled = true;
        });
        if (selected === q.correct) score++;
        document.getElementById('next-btn').style.display = 'block';
    }
    document.getElementById('next-btn').addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quiz.questions.length) {
            showQuestion();
            updateQuestionNav();
        } else {
            showResults();
        }
    });
    function startTimer() {
        let timeLeft = quiz.time * 60;
        timer = setInterval(() => {
            document.getElementById('time-left').textContent = Math.floor(timeLeft / 60) + ':' + (timeLeft % 60).toString().padStart(2, '0');
            if (timeLeft <= 0) {
                clearInterval(timer);
                showResults();
            }
            timeLeft--;
        }, 1000);
    }
    function showResults() {
        clearInterval(timer);
        quizDisplay.style.display = 'none';
        results.style.display = 'block';
        document.getElementById('score').textContent = `Bạn trả lời đúng ${score}/${quiz.questions.length} câu.`;
    }
}
