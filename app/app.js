(function () {
  "use strict";

  const STORAGE_KEY = "korean-app-progress-v1";
  const TABS = [
    { id: "vocab", label: "어휘", labelEn: "Vocabulary" },
    { id: "grammar", label: "문법", labelEn: "Grammar" },
    { id: "dialogue", label: "대화문", labelEn: "Dialogue" },
    { id: "quiz", label: "연습문제", labelEn: "Practice Quiz" },
  ];

  let lessons = [];
  let currentLessonId = null;
  let currentTab = "vocab";
  let quizAnswers = {};
  let quizSubmitted = false;

  const lessonMain = document.getElementById("lessonMain");
  const lessonNav = document.getElementById("lessonNav");
  const overallProgressLabel = document.getElementById("overallProgressLabel");
  const overallProgressFill = document.getElementById("overallProgressFill");
  const resetProgressBtn = document.getElementById("resetProgressBtn");

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* localStorage unavailable; progress just won't persist */
    }
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      alert("이 브라우저는 음성 합성을 지원하지 않습니다. (Speech synthesis is not supported in this browser.)");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  function renderNav() {
    const progress = loadProgress();
    lessonNav.innerHTML = "";
    lessons.forEach((lesson, idx) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      const completed = progress[lesson.id] && progress[lesson.id].completed;
      btn.className = "lesson-nav-item" + (lesson.id === currentLessonId ? " active" : "") + (completed ? " completed" : "");
      btn.type = "button";
      btn.innerHTML =
        '<span class="badge">' + (completed ? "✓" : idx + 1) + "</span>" +
        '<span class="nav-text">' + escapeHtml(lesson.title) + "<small>" + escapeHtml(lesson.titleEn) + "</small></span>";
      btn.addEventListener("click", () => selectLesson(lesson.id));
      li.appendChild(btn);
      lessonNav.appendChild(li);
    });

    const total = lessons.length;
    const completedCount = lessons.filter((l) => progress[l.id] && progress[l.id].completed).length;
    overallProgressLabel.textContent = completedCount + " / " + total + " 완료";
    overallProgressFill.style.width = total ? Math.round((completedCount / total) * 100) + "%" : "0%";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function selectLesson(id) {
    currentLessonId = id;
    currentTab = "vocab";
    quizAnswers = {};
    quizSubmitted = false;
    renderNav();
    renderLesson();
  }

  function selectTab(tabId) {
    currentTab = tabId;
    renderLesson();
  }

  function getCurrentLesson() {
    return lessons.find((l) => l.id === currentLessonId);
  }

  function renderLesson() {
    const lesson = getCurrentLesson();
    if (!lesson) {
      lessonMain.innerHTML = "<p>수업을 불러오는 중입니다...</p>";
      return;
    }

    const objectivesHtml = lesson.objectives
      .map((o) => "<li>" + escapeHtml(o) + "</li>")
      .join("");

    const tabsHtml = TABS.map(
      (t) =>
        '<button class="tab-btn' +
        (currentTab === t.id ? " active" : "") +
        '" data-tab="' +
        t.id +
        '" type="button">' +
        t.label +
        "</button>"
    ).join("");

    lessonMain.innerHTML =
      '<div class="lesson-header">' +
      '<span class="level-badge">' + escapeHtml(lesson.level) + "</span>" +
      "<h2>" + escapeHtml(lesson.title) + "</h2>" +
      '<p class="en">' + escapeHtml(lesson.titleEn) + "</p>" +
      "</div>" +
      '<div class="objectives"><h3>학습 목표 (Objectives)</h3><ul>' + objectivesHtml + "</ul></div>" +
      '<div class="tabs">' + tabsHtml + "</div>" +
      '<div class="tab-content" id="tabContent"></div>';

    lessonMain.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectTab(btn.dataset.tab));
    });

    const tabContent = document.getElementById("tabContent");
    if (currentTab === "vocab") renderVocabTab(tabContent, lesson);
    else if (currentTab === "grammar") renderGrammarTab(tabContent, lesson);
    else if (currentTab === "dialogue") renderDialogueTab(tabContent, lesson);
    else if (currentTab === "quiz") renderQuizTab(tabContent, lesson);
  }

  function renderVocabTab(container, lesson) {
    const cardsHtml = lesson.vocab
      .map(
        (v, i) =>
          '<div class="vocab-card">' +
          '<span class="ko">' + escapeHtml(v.ko) + "</span>" +
          '<span class="roman">' + escapeHtml(v.romanization) + "</span>" +
          '<span class="en">' + escapeHtml(v.en) + "</span>" +
          '<button class="speak-btn" data-text="' + escapeHtml(v.ko) + '" type="button">🔊 듣기</button>' +
          "</div>"
      )
      .join("");
    container.innerHTML = '<div class="vocab-grid">' + cardsHtml + "</div>";
    container.querySelectorAll(".speak-btn").forEach((btn) => {
      btn.addEventListener("click", () => speak(btn.dataset.text));
    });
  }

  function renderGrammarTab(container, lesson) {
    const html = lesson.grammar
      .map((g) => {
        const examplesHtml = g.examples
          .map(
            (ex) =>
              '<div class="example-row"><span class="ex-ko">' +
              escapeHtml(ex.ko) +
              '</span><span class="ex-en">' +
              escapeHtml(ex.en) +
              "</span></div>"
          )
          .join("");
        return (
          '<div class="grammar-card">' +
          '<div class="pattern">' + escapeHtml(g.pattern) + "</div>" +
          '<div class="explanation">' + escapeHtml(g.explanation) + "</div>" +
          examplesHtml +
          "</div>"
        );
      })
      .join("");
    container.innerHTML = html;
  }

  function renderDialogueTab(container, lesson) {
    const linesHtml = lesson.dialogue
      .map(
        (d) =>
          '<div class="dialogue-line">' +
          '<span class="speaker-badge">' + escapeHtml(d.speaker) + "</span>" +
          '<div class="line-text"><div class="ko">' +
          escapeHtml(d.ko) +
          '</div><div class="en">' +
          escapeHtml(d.en) +
          "</div></div>" +
          '<button class="speak-btn" data-text="' + escapeHtml(d.ko) + '" type="button">🔊</button>' +
          "</div>"
      )
      .join("");
    container.innerHTML =
      '<div class="dialogue-box">' + linesHtml + "</div>" +
      '<button class="btn primary" id="playAllBtn" type="button" style="margin-top:14px;">▶ 전체 듣기</button>';

    container.querySelectorAll(".speak-btn").forEach((btn) => {
      btn.addEventListener("click", () => speak(btn.dataset.text));
    });

    document.getElementById("playAllBtn").addEventListener("click", () => {
      const fullText = lesson.dialogue.map((d) => d.ko).join(". ");
      speak(fullText);
    });
  }

  function renderQuizTab(container, lesson) {
    const html = lesson.quiz
      .map((q, i) => {
        if (q.type === "mcq") {
          const optionsHtml = q.options
            .map(
              (opt, oi) =>
                '<label class="quiz-option"><input type="radio" name="q' +
                i +
                '" value="' +
                escapeHtml(opt) +
                '" />' +
                escapeHtml(opt) +
                "</label>"
            )
            .join("");
          return (
            '<div class="quiz-question" data-index="' + i + '">' +
            '<div class="q-text">' + (i + 1) + ". " + escapeHtml(q.question) + "</div>" +
            '<div class="quiz-options">' + optionsHtml + "</div>" +
            '<div class="quiz-feedback" id="feedback' + i + '"></div>' +
            "</div>"
          );
        }
        return (
          '<div class="quiz-question quiz-fill" data-index="' + i + '">' +
          '<div class="q-text">' + (i + 1) + ". " + escapeHtml(q.question) + "</div>" +
          '<input type="text" id="fillInput' + i + '" placeholder="답을 입력하세요" autocomplete="off" />' +
          '<div class="quiz-feedback" id="feedback' + i + '"></div>' +
          "</div>"
        );
      })
      .join("");

    container.innerHTML =
      html +
      '<div class="quiz-actions">' +
      '<button class="btn primary" id="submitQuizBtn" type="button">채점하기</button>' +
      '<span class="quiz-result" id="quizResult"></span>' +
      "</div>";

    document.getElementById("submitQuizBtn").addEventListener("click", () => gradeQuiz(lesson));
  }

  function gradeQuiz(lesson) {
    let correctCount = 0;
    lesson.quiz.forEach((q, i) => {
      const questionEl = document.querySelector('.quiz-question[data-index="' + i + '"]');
      const feedbackEl = document.getElementById("feedback" + i);
      let userAnswer = "";

      if (q.type === "mcq") {
        const checked = document.querySelector('input[name="q' + i + '"]:checked');
        userAnswer = checked ? checked.value : "";
      } else {
        const input = document.getElementById("fillInput" + i);
        userAnswer = input ? input.value.trim() : "";
      }

      const isCorrect =
        userAnswer.length > 0 &&
        userAnswer.replace(/\s+/g, "") === String(q.answer).replace(/\s+/g, "");

      questionEl.classList.remove("correct", "incorrect");
      if (isCorrect) {
        correctCount++;
        questionEl.classList.add("correct");
        feedbackEl.textContent = "정답입니다! ✓";
        feedbackEl.className = "quiz-feedback correct-text";
      } else {
        questionEl.classList.add("incorrect");
        feedbackEl.textContent = "오답입니다. 정답: " + q.answer;
        feedbackEl.className = "quiz-feedback incorrect-text";
      }
    });

    const total = lesson.quiz.length;
    const score = Math.round((correctCount / total) * 100);
    document.getElementById("quizResult").textContent = "점수: " + score + "점 (" + correctCount + "/" + total + ")";

    const progress = loadProgress();
    const passed = score >= 80;
    progress[lesson.id] = {
      score: score,
      completed: passed || (progress[lesson.id] && progress[lesson.id].completed) || false,
    };
    saveProgress(progress);
    renderNav();

    if (passed) {
      document.getElementById("quizResult").textContent += " 🎉 통과!";
    }
  }

  resetProgressBtn.addEventListener("click", () => {
    if (confirm("모든 학습 진도를 초기화하시겠습니까? (This will reset all lesson progress.)")) {
      localStorage.removeItem(STORAGE_KEY);
      renderNav();
      if (currentLessonId) renderLesson();
    }
  });

  function init() {
    fetch("data/lessons.json")
      .then((res) => res.json())
      .then((data) => {
        lessons = data;
        currentLessonId = lessons[0].id;
        renderNav();
        renderLesson();
      })
      .catch((err) => {
        lessonMain.innerHTML =
          "<p>수업 데이터를 불러오지 못했습니다. 로컬 웹 서버(예: <code>python3 -m http.server</code>)를 통해 이 앱을 실행해 주세요.</p>" +
          "<p style='color:var(--color-text-muted);font-size:0.8rem;'>Failed to load lesson data. Please run this app via a local web server instead of opening the HTML file directly.</p>";
        console.error(err);
      });
  }

  init();
})();
