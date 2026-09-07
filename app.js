const words = [
  { id: 'lion', category: 'animals', kk: 'Арыстан', en: 'Lion' },
  { id: 'elephant', category: 'animals', kk: 'Піл', en: 'Elephant' },
  { id: 'horse', category: 'animals', kk: 'Жылқы', en: 'Horse' },
  { id: 'cat', category: 'animals', kk: 'Мысық', en: 'Cat' },
  { id: 'book', category: 'things', kk: 'Кітап', en: 'Book' },
  { id: 'chair', category: 'things', kk: 'Орындық', en: 'Chair' },
  { id: 'backpack', category: 'things', kk: 'Сөмке', en: 'Backpack' },
  { id: 'pencil', category: 'things', kk: 'Қарындаш', en: 'Pencil' },
  { id: 'apple', category: 'food', kk: 'Алма', en: 'Apple' },
  { id: 'bread', category: 'food', kk: 'Нан', en: 'Bread' },
  { id: 'milk', category: 'food', kk: 'Сүт', en: 'Milk' },
  { id: 'carrot', category: 'food', kk: 'Сәбіз', en: 'Carrot' },
  { id: 'tree', category: 'world', kk: 'Ағаш', en: 'Tree' },
  { id: 'sun', category: 'world', kk: 'Күн', en: 'Sun' },
  { id: 'car', category: 'world', kk: 'Көлік', en: 'Car' },
  { id: 'train', category: 'world', kk: 'Пойыз', en: 'Train' }
];

const ui = {
  kk: {
    kicker: 'СУРЕТТЕР СӨЙЛЕЙДІ', title: 'Көр, тыңда,<br><em>үйрен!</em>', description: 'Суретті бас — сөзді тыңда. Қазақша және ағылшынша жаңа сөздерді ойын арқылы есте сақта.',
    word: 'сөз', language: 'тіл', topic: 'тақырып', choose: 'ТАҚЫРЫПТЫ ТАҢДА', section: 'Қай сөздерді үйренеміз?', learn: 'Үйрену', quiz: 'Тап', listen: 'ТЫҢДА ДА, ТАП', prompt: 'Қай сурет айтылды?', footer: 'Кішкентай қадам — үлкен білім.',
    categories: { animals: '🦁 Жануарлар', things: '🎒 Заттар', food: '🍎 Тағамдар', world: '🌳 Әлем' }, correct: 'Дұрыс! Жарайсың! ⭐', wrong: 'Тағы бір рет ойлан', muted: 'Дыбыс өшірулі'
  },
  en: {
    kicker: 'PICTURES CAN TALK', title: 'See, listen,<br><em>learn!</em>', description: 'Tap a picture and hear the word. Learn new Kazakh and English words through play.',
    word: 'words', language: 'languages', topic: 'topics', choose: 'CHOOSE A TOPIC', section: 'What shall we learn today?', learn: 'Learn', quiz: 'Find it', listen: 'LISTEN AND FIND', prompt: 'Which picture did you hear?', footer: 'Small steps lead to big knowledge.',
    categories: { animals: '🦁 Animals', things: '🎒 Things', food: '🍎 Food', world: '🌳 Our world' }, correct: 'Correct! Well done! ⭐', wrong: 'Have another try', muted: 'Sound is off'
  }
};

let language = 'kk';
let category = 'animals';
let mode = 'learn';
let quizTarget = null;
let score = Number(localStorage.getItem('soz-alemi-score') || 0);
let soundOn = true;

const $ = (selector) => document.querySelector(selector);

function speak(text) {
  if (!soundOn || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'kk' ? 'kk-KZ' : 'en-US';
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((voice) => voice.lang.toLowerCase().startsWith(language === 'kk' ? 'kk' : 'en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

function translateUI() {
  const text = ui[language];
  document.documentElement.lang = language;
  $('#kicker').textContent = text.kicker;
  $('#heroTitle').innerHTML = text.title;
  $('#heroDescription').textContent = text.description;
  $('#wordBadge').textContent = text.word;
  $('#languageBadge').textContent = text.language;
  $('#topicBadge').textContent = text.topic;
  $('#chooseKicker').textContent = text.choose;
  $('#sectionTitle').textContent = text.section;
  $('#learnMode').textContent = text.learn;
  $('#quizMode').textContent = text.quiz;
  $('#listenLabel').textContent = text.listen;
  $('#quizPrompt').textContent = text.prompt;
  $('#footerText').textContent = text.footer;
  renderCategories();
  renderCards();
}

function renderCategories() {
  const container = $('#categories');
  container.innerHTML = '';
  Object.entries(ui[language].categories).forEach(([key, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-button${category === key ? ' active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', () => {
      category = key;
      renderCategories();
      renderCards();
      if (mode === 'quiz') newQuiz();
    });
    container.appendChild(button);
  });
}

function renderCards() {
  const container = $('#cardGrid');
  container.innerHTML = '';
  words.filter((word) => word.category === category).forEach((word) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'word-card';
    card.dataset.id = word.id;
    const primary = word[language];
    const secondary = word[language === 'kk' ? 'en' : 'kk'];
    card.innerHTML = `<span class="picture sprite-${word.id}" role="img" aria-label="${primary}"></span><span class="word-info"><span><strong>${primary}</strong><small>${secondary}</small></span><span class="speaker">🔊</span></span>`;
    card.addEventListener('click', () => handleCard(word, card));
    container.appendChild(card);
  });
}

function handleCard(word, card) {
  if (mode === 'learn') {
    speak(word[language]);
    card.classList.add('correct');
    setTimeout(() => card.classList.remove('correct'), 500);
    return;
  }
  if (word.id === quizTarget?.id) {
    card.classList.add('correct');
    score += 1;
    localStorage.setItem('soz-alemi-score', score);
    $('#score').textContent = score;
    showToast(ui[language].correct);
    setTimeout(newQuiz, 850);
  } else {
    card.classList.add('wrong');
    showToast(ui[language].wrong);
    setTimeout(() => card.classList.remove('wrong'), 450);
  }
}

function newQuiz() {
  const choices = words.filter((word) => word.category === category);
  let next = choices[Math.floor(Math.random() * choices.length)];
  if (choices.length > 1 && next.id === quizTarget?.id) next = choices[(choices.indexOf(next) + 1) % choices.length];
  quizTarget = next;
  document.querySelectorAll('.word-card').forEach((card) => card.classList.remove('correct', 'wrong'));
  setTimeout(() => speak(quizTarget[language]), 150);
}

function setMode(nextMode) {
  mode = nextMode;
  document.querySelectorAll('.mode-button').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  $('#quizBanner').hidden = mode !== 'quiz';
  if (mode === 'quiz') newQuiz();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.lang-button').forEach((button) => button.addEventListener('click', () => {
  language = button.dataset.lang;
  document.querySelectorAll('.lang-button').forEach((item) => item.classList.toggle('active', item === button));
  translateUI();
  if (mode === 'quiz') newQuiz();
}));

document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
$('#playQuestion').addEventListener('click', () => quizTarget && speak(quizTarget[language]));
$('#soundToggle').addEventListener('click', () => {
  soundOn = !soundOn;
  $('#soundToggle').textContent = soundOn ? '🔊' : '🔇';
  $('#soundToggle').setAttribute('aria-label', soundOn ? 'Дыбысты өшіру' : 'Дыбысты қосу');
  if (!soundOn) window.speechSynthesis?.cancel();
  showToast(soundOn ? '🔊' : ui[language].muted);
});

$('#score').textContent = score;
translateUI();
