document.addEventListener('DOMContentLoaded', () => {
  renderGlossary();
  renderQuiz();
});

// ============= GLOSSARY =============
function renderGlossary() {
  const container = document.getElementById('glossary-app');
  if (!container) return;
  let activeCategory = 'ทั้งหมด';
  let searchTerm = '';

  function buildHTML() {
    let filtered = glossaryTerms;
    if (activeCategory !== 'ทั้งหมด') filtered = filtered.filter(t => t.category === activeCategory);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.en.toLowerCase().includes(s) || t.th.includes(s) || t.reading.includes(s) || t.role.includes(s)
      );
    }
    return `
      <div class="glossary-toolbar">
        <input type="text" id="glossary-search" placeholder="🔍 ค้นหาคำศัพท์...">
        <div class="glossary-cats">
          ${glossaryCategories.map(cat => `<button class="glossary-cat${cat===activeCategory?' active':''}" data-cat="${cat}">${cat}</button>`).join('')}
        </div>
        <small style="color:var(--text-light)">พบ ${filtered.length} คำ</small>
      </div>
      <div style="overflow-x:auto;">
        <table class="glossary-table">
          <thead><tr><th>ศัพท์</th><th>คำอ่าน</th><th>หน้าที่</th></tr></thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td class="term-en">${t.en} <span style="font-weight:400;color:var(--text-light)">(${t.th})</span></td>
                <td>${t.reading}</td>
                <td>${t.role}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = buildHTML();
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('glossary-cat')) {
      activeCategory = e.target.dataset.cat;
      container.querySelector('#glossary-search').value = '';
      searchTerm = '';
      container.innerHTML = buildHTML();
      bindSearch();
    }
  });
  function bindSearch() {
    const input = container.querySelector('#glossary-search');
    if (input) {
      input.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        container.innerHTML = buildHTML();
        bindSearch();
      });
    }
  }
  bindSearch();
}

// ============= QUIZ =============
function renderQuiz() {
  const container = document.getElementById('quiz-app');
  if (!container) return;
  let currentQuestion = 0;
  let score = 0;
  let answers = new Array(quizQuestions.length).fill(null);
  let answered = false;

  function showQuestion() {
    if (currentQuestion >= quizQuestions.length) {
      showScore();
      return;
    }
    const q = quizQuestions[currentQuestion];
    answered = false;
    container.innerHTML = `
      <div style="margin-bottom:16px;font-size:14px;color:var(--text-light)">ข้อ ${currentQuestion+1} / ${quizQuestions.length}</div>
      <div style="font-size:20px;font-weight:600;margin-bottom:20px;">${q.question}</div>
      <div>${q.options.map((opt, idx) => `
        <div class="quiz-opt" data-idx="${idx}">
          <span class="quiz-opt-letter">${String.fromCharCode(65+idx)}</span> ${opt}
        </div>
      `).join('')}</div>
      <div id="quiz-result" style="margin-top:16px;"></div>
      <button id="next-btn" class="next-btn" style="display:none;">ข้อถัดไป →</button>
    `;

    container.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', function() {
        if (answered) return;
        answered = true;
        const selected = parseInt(this.dataset.idx);
        const correct = q.correct;
        const isCorrect = selected === correct;
        answers[currentQuestion] = isCorrect;
        if (isCorrect) score++;

        const resultDiv = document.getElementById('quiz-result');
        resultDiv.innerHTML = `
          <div style="padding:12px;border-radius:8px;background:${isCorrect?'#e8f0e8':'#f9e8e8'};">
            ${isCorrect ? '✅ ถูกต้อง!' : '❌ ยังไม่ถูก'}
            <div style="margin-top:8px;color:var(--text-light);">${q.explanation}</div>
            ${q.refSection ? `<a href="#${q.refSection}" style="color:var(--accent);">🔍 อ่านเนื้อหาส่วนนี้</a>` : ''}
          </div>
        `;
        container.querySelectorAll('.quiz-opt').forEach((b, idx) => {
          if (idx === correct) b.classList.add('correct');
          else if (idx === selected && !isCorrect) b.classList.add('wrong');
          b.style.pointerEvents = 'none';
        });
        document.getElementById('next-btn').style.display = 'inline-block';
      });
    });
    document.getElementById('next-btn').addEventListener('click', () => {
      currentQuestion++;
      showQuestion();
    });
  }

  function showScore() {
    container.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:48px;color:var(--accent);">${score}/${quizQuestions.length}</div>
        <p style="color:var(--text-light);">${score >= Math.ceil(quizQuestions.length*0.7) ? '🎉 เยี่ยมมาก!' : '💪 ลองอีกครั้งนะ'}</p>
        <button class="restart-btn" onclick="renderQuiz()">ทำใหม่</button>
      </div>
    `;
  }

  showQuestion();
}