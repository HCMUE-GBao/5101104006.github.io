
var firebaseConfig = {
  apiKey: "AIzaSyA_M3X9VxAOH0jKy799avu09BPA480WHpA",
  authDomain: "hcmue-a95cd.firebaseapp.com",
  projectId: "hcmue-a95cd",
  storageBucket: "hcmue-a95cd.appspot.com",
  messagingSenderId: "847360348342",
  appId: "1:847360348342:web:d16d48c63511cd613c1617"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ============================
// 2. Xử lý đăng nhập
// ============================
const authForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");
const userActions = document.getElementById("user-actions");

authForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            authMessage.style.color = "green";
            authMessage.textContent = "🎉 Đăng nhập thành công!";
        })
        .catch((error) => {
            authMessage.style.color = "red";
            authMessage.textContent = "❌ " + error.message;
        });
});


// ============================
// 3. Theo dõi trạng thái đăng nhập (auto)
// ============================
auth.onAuthStateChanged((user) => {
    if (user) {
        // Đã đăng nhập → Ẩn form, hiện các nút chức năng
        authForm.style.display = "none";
        userActions.style.display = "flex";
        authMessage.textContent = `👋 Xin chào, ${user.email}`;
        authMessage.style.color = "green";
    } else {
        // Chưa đăng nhập → Hiện form, ẩn các nút chức năng
        authForm.style.display = "block";
        userActions.style.display = "none";
        authMessage.textContent = "";
    }
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
    auth.signOut().then(() => {
        authMessage.style.color = "blue";
        authMessage.textContent = "Bạn đã đăng xuất!";
    });
});

//                            
// Firebase Config (Đã cập nhật với config của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyA_M3X9VxAOH0jKy799avu09BPA480WHpA",
  authDomain: "hcmue-a95cd.firebaseapp.com",
  projectId: "hcmue-a95cd",
  storageBucket: "hcmue-a95cd.appspot.com",
  messagingSenderId: "847360348342",
  appId: "1:847360348342:web:d16d48c63511cd613c1617"
};

// Khởi tạo Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    alert("Lỗi khởi tạo Firebase. Kiểm tra config!");
}
const auth = firebase.auth();
const db = firebase.firestore();  // Thêm Firestore

// Auth Logic for index.html (Login) - Giữ nguyên
if (document.getElementById('auth-form')) {
    // ... (giữ nguyên code auth như cũ)
}

// Signup Logic for signup.html - Giữ nguyên
if (document.getElementById('signup-form')) {
    // ... (giữ nguyên code signup như cũ)
}

// Create Quiz Logic (for create-quiz.html) - Cập nhật để lưu lên Firestore và thêm điểm
if (document.getElementById('quiz-form')) {
    const form = document.getElementById('quiz-form');
    const addQuestionBtn = document.getElementById('add-question');
    const questionsContainer = document.getElementById('questions-container');
    const message = document.getElementById('quiz-message');

    // Hàm tạo question card mới với 2 đáp án mặc định và input điểm
    function createQuestionCard() {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <label><i class="fas fa-question"></i> Câu Hỏi: <input type="text" class="question" required></label>
            <label>Điểm: <input type="number" class="points" min="1" value="1" required></label>
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

    // Thêm câu hỏi mới - Giữ nguyên
    addQuestionBtn.addEventListener('click', () => {
        console.log("Adding new question...");
        const newQuestion = createQuestionCard();
        questionsContainer.appendChild(newQuestion);
        attachAnswerEvents(newQuestion);
        console.log("Question added successfully.");
    });

    // Gắn sự kiện cho đáp án - Giữ nguyên, nhưng cập nhật correct options
    function attachAnswerEvents(questionCard) {
        const addAnswerBtn = questionCard.querySelector('.add-answer');
        const answersDiv = questionCard.querySelector('.answers');
        const correctSelect = questionCard.querySelector('.correct-answer');
        addAnswerBtn.addEventListener('click', () => {
            console.log("Adding new answer...");
            const answerCount = answersDiv.querySelectorAll('.answer-item').length;
            if (answerCount < 4) {
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
        answersDiv.querySelectorAll('.remove-answer').forEach(btn => attachRemoveEvent(btn, questionCard));
    }

    function attachRemoveEvent(btn, questionCard) {
        btn.addEventListener('click', () => {
            console.log("Removing answer...");
            const answersDiv = questionCard.querySelector('.answers');
            const answerItems = answersDiv.querySelectorAll('.answer-item');
            if (answerItems.length > 2) {
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

    // Submit form và lưu lên Firestore
    form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log("Submitting form...");
        const title = document.getElementById('quiz-title').value.trim();
        const time = parseInt(document.getElementById('quiz-time').value);
        const questions = Array.from(document.querySelectorAll('.question-card')).map(card => {
            const question = card.querySelector('.question').value.trim();
            const points = parseInt(card.querySelector('.points').value);
            const answers = Array.from(card.querySelectorAll('.answer')).map(input => input.value.trim()).filter(val => val);
            const correct = parseInt(card.querySelector('.correct-answer').value);
            if (!question || answers.length < 2 || points < 1) {
                message.textContent = 'Mỗi câu hỏi cần có nội dung, ít nhất 2 đáp án và điểm >=1!';
                message.className = 'error';
                console.error("Validation failed.");
                return null;
            }
            return { question, answers, correct, points };
        }).filter(q => q !== null);

        if (!title || questions.length === 0) {
            message.textContent = 'Vui lòng nhập tiêu đề và ít nhất 1 câu hỏi!';
            message.className = 'error';
            return;
        }

        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        if (totalPoints === 0) {
            message.textContent = 'Tổng điểm phải > 0!';
            message.className = 'error';
            return;
        }

        const quiz = { title, time, questions, totalPoints, createdBy: auth.currentUser ? auth.currentUser.uid : null };

        try {
            const docRef = await db.collection('quizzes').add(quiz);
            const quizLink = `${window.location.origin}/play-quiz.html?id=${docRef.id}`;
            message.innerHTML = `Quiz đã tạo thành công! Liên kết: <a href="${quizLink}" target="_blank">${quizLink}</a>`;
            message.className = 'success';
            console.log("Quiz saved to Firestore with ID:", docRef.id);
        } catch (error) {
            console.error("Error saving quiz:", error);
            message.textContent = 'Lỗi lưu quiz: ' + error.message;
            message.className = 'error';
        }
    });
}

// Play Quiz Logic (for play-quiz.html) - Cập nhật để fetch từ Firestore, thêm nav clickable, lưu answers, tính điểm
if (document.getElementById('quiz-id-input')) {
    const quizIdInput = document.getElementById('quiz-id-input');
    const loadQuizBtn = document.getElementById('load-quiz-btn');
    const quizDisplay = document.getElementById('quiz-display');
    const results = document.getElementById('results');
    let quiz, currentQuestion = 0, answers = [], timer;

    // Load quiz từ Firestore
    loadQuizBtn.addEventListener('click', async () => {
        const quizId = quizIdInput.value.trim();
        if (!quizId) {
            alert("Vui lòng nhập ID quiz!");
            return;
        }
        try {
            const doc = await db.collection('quizzes').doc(quizId).get();
            if (doc.exists) {
                quiz = doc.data();
                answers = new Array(quiz.questions.length).fill(null);  // Lưu câu trả lời
                displayQuiz();
                startTimer();
            } else {
                alert("Quiz không tồn tại!");
            }
        } catch (error) {
            console.error("Error loading quiz:", error);
            alert("Lỗi tải quiz: " + error.message);
        }
    });

    function displayQuiz() {
        quizDisplay.style.display = 'block';
        document.getElementById('upload-card').style.display = 'none';
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
            btn.classList.add(answers[i] !== null ? 'answered' : 'unanswered');
            if (i === currentQuestion) btn.classList.add('active');
            btn.addEventListener('click', () => {
                currentQuestion = i;
                showQuestion();
                updateQuestionNav();
            });
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
            if (answers[currentQuestion] === i) btn.classList.add('selected');  // Highlight nếu đã chọn
            btn.addEventListener('click', () => {
                answers[currentQuestion] = i;  // Lưu câu trả lời
                updateQuestionNav();
                // Không highlight ngay, chỉ lưu
            });
            answersDiv.appendChild(btn);
        });
        document.getElementById('next-btn').style.display = currentQuestion < quiz.questions.length - 1 ? 'block' : 'none';
        document.getElementById('prev-btn').style.display = currentQuestion > 0 ? 'block' : 'none';
        document.getElementById('finish-btn').style.display = 'block';  // Luôn hiện nút kết thúc
    }

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentQuestion < quiz.questions.length - 1) {
            currentQuestion++;
            showQuestion();
            updateQuestionNav();
        }
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
            updateQuestionNav();
        }
    });

    document.getElementById('finish-btn').addEventListener('click', () => {
        showResults();
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
        let earnedPoints = 0;
        answers.forEach((ans, i) => {
            if (ans === quiz.questions[i].correct) earnedPoints += quiz.questions[i].points;
        });
        const percentage = ((earnedPoints / quiz.totalPoints) * 100).toFixed(2);
        document.getElementById('score').textContent = `Bạn đạt ${earnedPoints}/${quiz.totalPoints} điểm (${percentage}%).`;
    }
}
