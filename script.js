// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA_M3X9VxAOH0jKy799avu09BPA480WHpA",
  authDomain: "hcmue-a95cd.firebaseapp.com",
  projectId: "hcmue-a95cd",
  storageBucket: "hcmue-a95cd.firebasestorage.app",
  messagingSenderId: "847360348342",
  appId: "1:847360348342:web:d16d48c63511cd613c1617",
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase init failed:", e);
}

const db = firebase.firestore();

// Tạo ID Quiz ngẫu nhiên
function generateQuizId() {
  const part = () => Math.random().toString(36).substring(2, 5);
  return `${part()}-${part()}-${part()}`;
}

// --- Logic cho trang create-quiz.html ---
if (document.getElementById('quiz-form')) {
  const form = document.getElementById('quiz-form');
  const questionsContainer = document.getElementById('questions-container');
  const addQuestionBtn = document.getElementById('add-question');
  const message = document.getElementById('quiz-message');

  // Tạo question card mới
  function createQuestionCard() {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML = `
        <label>Câu hỏi:
            <input type="text" class="question" required>
        </label>
        <label>Điểm:
            <input type="number" class="point" value="1" min="1" required>
        </label>
        <div class="answers">
            <div class="answer-item">
                <input type="text" class="answer" placeholder="Đáp án 1" required>
                <button type="button" class="remove-answer" style="display:none;">X</button>
            </div>
            <div class="answer-item">
                <input type="text" class="answer" placeholder="Đáp án 2" required>
                <button type="button" class="remove-answer" style="display:none;">X</button>
            </div>
        </div>
        <button type="button" class="add-answer">+ Thêm đáp án</button>
        <select class="correct-answer">
            <option value="0">Đáp án đúng 1</option>
            <option value="1">Đáp án đúng 2</option>
        </select>
    `;
    attachAnswerEvents(card);
    return card;
  }

  // Thêm/xóa đáp án
  function attachAnswerEvents(card) {
    const answersDiv = card.querySelector('.answers');
    const addBtn = card.querySelector('.add-answer');
    const correctSelect = card.querySelector('.correct-answer');

    addBtn.addEventListener('click', () => {
      const count = answersDiv.querySelectorAll('.answer-item').length;
      if (count >= 4) return alert("Tối đa 4 đáp án!");
      const item = document.createElement('div');
      item.className = 'answer-item';
      item.innerHTML = `<input type="text" class="answer" placeholder="Đáp án ${count+1}" required>
                          <button type="button" class="remove-answer">X</button>`;
      answersDiv.appendChild(item);
      updateCorrectOptions(card);
      item.querySelector('.remove-answer').addEventListener('click', () => {
        if (answersDiv.querySelectorAll('.answer-item').length > 2) {
          item.remove();
          updateCorrectOptions(card);
        } else alert("Phải có ít nhất 2 đáp án!");
      });
    });

    answersDiv.querySelectorAll('.remove-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answersDiv.querySelectorAll('.answer-item').length > 2) {
          btn.parentElement.remove();
          updateCorrectOptions(card);
        }
      });
    });
  }

  // Cập nhật select đáp án đúng
  function updateCorrectOptions(card) {
    const answers = card.querySelectorAll('.answer-item');
    const select = card.querySelector('.correct-answer');
    select.innerHTML = '';
    answers.forEach((_, i) => {
      select.innerHTML += `<option value="${i}">Đáp án đúng ${i+1}</option>`;
    });
  }

  // Xử lý form tạo quiz
  questionsContainer.appendChild(createQuestionCard());
  addQuestionBtn.addEventListener('click', () => {
    questionsContainer.appendChild(createQuestionCard());
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('quiz-title').value.trim();
    const time = parseInt(document.getElementById('quiz-time').value);
    const questions = Array.from(questionsContainer.querySelectorAll('.question-card')).map(card => {
      const question = card.querySelector('.question').value.trim();
      const answers = Array.from(card.querySelectorAll('.answer')).map(a => a.value.trim());
      const correct = parseInt(card.querySelector('.correct-answer').value);
      const point = parseInt(card.querySelector('.point').value);
      return { question, answers, correct, point };
    });

    if (!title || questions.length === 0) {
      message.textContent = "Vui lòng nhập tiêu đề và ít nhất 1 câu hỏi!";
      message.className = 'error';
      return;
    }

    const quiz = { title, time, questions };
    const quizId = generateQuizId();

    db.collection("quizzes").doc(quizId).set(quiz)
      .then(() => {
        message.innerHTML = `Tạo quiz thành công! ID: ${quizId}<br>
                             <a href="play-quiz.html?id=${quizId}" target="_blank">Truy cập Quiz</a>`;
        message.className = 'success';
      })
      .catch(err => {
        message.textContent = "Lỗi khi lưu quiz: " + err.message;
        message.className = 'error';
      });
  });
}

// --- Logic cho trang play-quiz.html ---
if (document.getElementById('quiz-display')) {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");

  if (!quizId) {
    alert("ID Quiz không hợp lệ!");
  } else {
    db.collection("quizzes").doc(quizId).get().then(doc => {
      if (!doc.exists) return alert("Quiz không tồn tại!");
      const quiz = doc.data();
      startQuiz(quiz);
    });
  }

  function startQuiz(quiz) {
    let currentQuestion = 0;
    const answersChosen = {};
    let timer;

    document.getElementById("quiz-title").textContent = quiz.title;
    document.getElementById("quiz-display").style.display = "block";

    startTimer(quiz.time);
    showQuestion(quiz, currentQuestion, answersChosen);

    function startTimer(minutes) {
      let timeLeft = minutes * 60;
      timer = setInterval(() => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById("time-left").textContent = `${m}:${s.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) { clearInterval(timer); showResults(quiz, answersChosen); }
        timeLeft--;
      }, 1000);
    }

    function showQuestion(quiz, currentQuestion, answersChosen) {
      const q = quiz.questions[currentQuestion];
      document.getElementById("question-text").textContent = q.question;
      const ansDiv = document.getElementById("answers");
      ansDiv.innerHTML = "";

      q.answers.forEach((txt, i) => {
        const btn = document.createElement("button");
        btn.textContent = txt;
        if (answersChosen[currentQuestion] === i) btn.classList.add("selected");
        btn.addEventListener("click", () => { answersChosen[currentQuestion] = i; showQuestion(quiz, currentQuestion, answersChosen); });
        ansDiv.appendChild(btn);
      });

      document.getElementById("next-btn").style.display = "block";
    }

    document.getElementById("next-btn").addEventListener("click", () => {
      if (currentQuestion < quiz.questions.length - 1) {
        currentQuestion++;
        showQuestion(quiz, currentQuestion, answersChosen);
        updateQuestionNav(quiz, currentQuestion);
      } else {
        showResults(quiz, answersChosen);
      }
    });

    function updateQuestionNav(quiz, currentQuestion) {
      const nav = document.getElementById("question-nav");
      nav.innerHTML = "";
      quiz.questions.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        if (i === currentQuestion) btn.classList.add("active");
        btn.addEventListener("click", () => { currentQuestion = i; showQuestion(quiz, currentQuestion, answersChosen); updateQuestionNav(quiz, currentQuestion); });
        nav.appendChild(btn);
      });
    }

    function showResults(quiz, answersChosen) {
      clearInterval(timer);
      let total = 0, gain = 0;
      quiz.questions.forEach((q, i) => {
        total += q.point;
        if (answersChosen[i] === q.correct) gain += q.point;
      });

      document.getElementById("quiz-display").style.display = "none";
      const r = document.getElementById("results");
      r.style.display = "block";
      r.innerHTML = `
        <h2>Kết Quả</h2>
        <p>Bạn đạt <b>${gain}</b> / ${total} điểm</p>
        <h3>Chi tiết câu hỏi</h3>
        ${quiz.questions.map((q, i) => `
            <div class="result-item">
                <p><b>Câu ${i+1}:</b> ${q.question}</p>
                <p>Đáp án của bạn: ${q.answers[answersChosen[i]] ?? "(không chọn)"}</p>
                <p style="color:${answersChosen[i] === q.correct ? "green" : "red"}">
                    ${answersChosen[i] === q.correct ? "✓ Đúng" : "✗ Sai"}
                </p>
            </div>
        `).join("")}
      `;
    }
  }
}
