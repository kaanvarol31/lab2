'use strict';

// Every entry contains a verified/common translation. Add more entries here!
// The meaning is shown before the player guesses the language.
const WORDS = [
  {word:'Bonjour',language:'French',meaning:'Hello'},
  {word:'Merci',language:'French',meaning:'Thank you'},
  {word:'Papillon',language:'French',meaning:'Butterfly'},
  {word:'Bibliothèque',language:'French',meaning:'Library'},
  {word:'Hola',language:'Spanish',meaning:'Hello'},
  {word:'Gracias',language:'Spanish',meaning:'Thank you'},
  {word:'Mariposa',language:'Spanish',meaning:'Butterfly'},
  {word:'Ventana',language:'Spanish',meaning:'Window'},
  {word:'Ciao',language:'Italian',meaning:'Hello / goodbye'},
  {word:'Grazie',language:'Italian',meaning:'Thank you'},
  {word:'Farfalla',language:'Italian',meaning:'Butterfly'},
  {word:'Finestra',language:'Italian',meaning:'Window'},
  {word:'Hallo',language:'German',meaning:'Hello'},
  {word:'Danke',language:'German',meaning:'Thank you'},
  {word:'Schmetterling',language:'German',meaning:'Butterfly'},
  {word:'Fenster',language:'German',meaning:'Window'},
  {word:'Olá',language:'Portuguese',meaning:'Hello'},
  {word:'Obrigado',language:'Portuguese',meaning:'Thank you (said by a male speaker)'},
  {word:'Borboleta',language:'Portuguese',meaning:'Butterfly'},
  {word:'Janela',language:'Portuguese',meaning:'Window'},
  {word:'Merhaba',language:'Turkish',meaning:'Hello'},
  {word:'Teşekkürler',language:'Turkish',meaning:'Thanks'},
  {word:'Kelebek',language:'Turkish',meaning:'Butterfly'},
  {word:'Pencere',language:'Turkish',meaning:'Window'},
  {word:'Здравей',language:'Bulgarian',meaning:'Hello (informal)'},
  {word:'Благодаря',language:'Bulgarian',meaning:'Thank you'},
  {word:'Пеперуда',language:'Bulgarian',meaning:'Butterfly'},
  {word:'Прозорец',language:'Bulgarian',meaning:'Window'},
  {word:'Привет',language:'Russian',meaning:'Hello (informal)'},
  {word:'Спасибо',language:'Russian',meaning:'Thank you'},
  {word:'Бабочка',language:'Russian',meaning:'Butterfly'},
  {word:'Окно',language:'Russian',meaning:'Window'},
  {word:'Γεια',language:'Greek',meaning:'Hello / hi'},
  {word:'Ευχαριστώ',language:'Greek',meaning:'Thank you'},
  {word:'Πεταλούδα',language:'Greek',meaning:'Butterfly'},
  {word:'Παράθυρο',language:'Greek',meaning:'Window'},
  {word:'こんにちは',language:'Japanese',meaning:'Hello / good afternoon'},
  {word:'ありがとう',language:'Japanese',meaning:'Thank you'},
  {word:'蝶',language:'Japanese',meaning:'Butterfly'},
  {word:'窓',language:'Japanese',meaning:'Window'},
  {word:'안녕하세요',language:'Korean',meaning:'Hello'},
  {word:'감사합니다',language:'Korean',meaning:'Thank you'},
  {word:'나비',language:'Korean',meaning:'Butterfly'},
  {word:'창문',language:'Korean',meaning:'Window'},
  {word:'你好',language:'Mandarin Chinese',meaning:'Hello'},
  {word:'谢谢',language:'Mandarin Chinese',meaning:'Thank you'},
  {word:'蝴蝶',language:'Mandarin Chinese',meaning:'Butterfly'},
  {word:'窗户',language:'Mandarin Chinese',meaning:'Window'},
  {word:'Hej',language:'Swedish',meaning:'Hello'},
  {word:'Tack',language:'Swedish',meaning:'Thank you'},
  {word:'Fjäril',language:'Swedish',meaning:'Butterfly'},
  {word:'Fönster',language:'Swedish',meaning:'Window'},
  {word:'Hei',language:'Finnish',meaning:'Hello'},
  {word:'Kiitos',language:'Finnish',meaning:'Thank you'},
  {word:'Perhonen',language:'Finnish',meaning:'Butterfly'},
  {word:'Ikkuna',language:'Finnish',meaning:'Window'},
  {word:'Szia',language:'Hungarian',meaning:'Hello (informal)'},
  {word:'Köszönöm',language:'Hungarian',meaning:'Thank you'},
  {word:'Pillangó',language:'Hungarian',meaning:'Butterfly'},
  {word:'Ablak',language:'Hungarian',meaning:'Window'},
  {word:'Cześć',language:'Polish',meaning:'Hi'},
  {word:'Dziękuję',language:'Polish',meaning:'Thank you'},
  {word:'Motyl',language:'Polish',meaning:'Butterfly'},
  {word:'Okno',language:'Polish',meaning:'Window'},
  {word:'გამარჯობა',language:'Georgian',meaning:'Hello'},
  {word:'მადლობა',language:'Georgian',meaning:'Thank you'},
  {word:'პეპელა',language:'Georgian',meaning:'Butterfly'},
  {word:'ფანჯარა',language:'Georgian',meaning:'Window'},
  {word:'مرحبا',language:'Arabic',meaning:'Hello'},
  {word:'شكرا',language:'Arabic',meaning:'Thank you'},
  {word:'فراشة',language:'Arabic',meaning:'Butterfly'},
  {word:'نافذة',language:'Arabic',meaning:'Window'},
  {word:'שלום',language:'Hebrew',meaning:'Hello / peace'},
  {word:'תודה',language:'Hebrew',meaning:'Thank you'},
  {word:'פרפר',language:'Hebrew',meaning:'Butterfly'},
  {word:'חלון',language:'Hebrew',meaning:'Window'}
];
const API_URL = "https://tapdict.com/api/v1";

async function loadAPIWords() {
  const searches = ["house", "water", "sun", "book", "love"];

  try {
    const results = await Promise.all(
      searches.map(async (term) => {
        const url =
          `${API_URL}/dictionaries/norwegian-bokmal-english/search?q=${encodeURIComponent(term)}&limit=10`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        return data.results || [];
      })
    );

    const seen = new Set();

    for (const entries of results) {
      for (const entry of entries) {
        if (!entry.headword || !entry.gloss) continue;

        const word = entry.headword.trim().toLowerCase();
        if (seen.has(word)) continue;
        seen.add(word);

        WORDS.push({
          word: entry.headword,
          language: "Norwegian",
          meaning: entry.gloss
        });
      }
    }
  } catch (error) {
    console.error("Could not load API words:", error);
  }
}
const LEVELS = {
  easy: ['French','Spanish','Italian','German','Portuguese'],
  mixed: ['French','Spanish','Italian','German','Portuguese','Turkish','Bulgarian','Russian','Greek','Japanese','Korean','Mandarin Chinese','Swedish','Finnish','Hungarian','Polish','Georgian','Arabic','Hebrew','Norwegian'],
  hard: ['Turkish','Bulgarian','Russian','Greek','Japanese','Korean','Mandarin Chinese','Finnish','Hungarian','Polish','Georgian','Arabic','Hebrew']
};
const ROUND_LENGTH = 10;
const $ = id => document.getElementById(id);
let deck = [], index = 0, score = 0, answered = false, languages = [];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
let apiWordsLoaded = false;
async function startGame() {
  if (!apiWordsLoaded) {
    await loadAPIWords();
    apiWordsLoaded = true;
  }

  languages = LEVELS[$('difficulty').value];
  deck = shuffle(WORDS.filter(item => languages.includes(item.language))).slice(0, ROUND_LENGTH);
  index = 0;
  score = 0;
  $('score').textContent = score;
  $('result-screen').hidden = true;
  $('question-screen').hidden = false;
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const entry = deck[index];
  $('round-label').textContent = `QUESTION ${index + 1} OF ${deck.length}`;
  $('progress-fill').style.width = `${(index / deck.length) * 100}%`;
  $('progress-track').setAttribute('aria-valuemax', String(deck.length));
  $('progress-track').setAttribute('aria-valuenow', String(index));
  $('word').textContent = entry.word;
  $('meaning').textContent = entry.meaning;
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('next-button').hidden = true;

  const wrong = shuffle(languages.filter(language => language !== entry.language)).slice(0, 3);
  const options = shuffle([entry.language, ...wrong]);
  const container = $('choices');
  container.replaceChildren();
  options.forEach((language, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    const text = document.createElement('span');
    text.textContent = language;
    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = String.fromCharCode(65 + i);
    button.append(letter, text);
    button.addEventListener('click', () => answer(language));
    container.append(button);
  });
}

function answer(choice) {
  if (answered) return;
  answered = true;
  const correct = deck[index].language;
  const isCorrect = choice === correct;
  if (isCorrect) {
    score++;
    $('score').textContent = score;
  }
  for (const button of $('choices').children) {
    const language = button.children[1].textContent;
    button.disabled = true;
    if (language === correct) {
      button.classList.add('correct');
      const mark = document.createElement('span');
      mark.className = 'choice-symbol'; mark.textContent = '✓';
      button.append(mark);
    } else if (language === choice) {
      button.classList.add('incorrect');
      const mark = document.createElement('span');
      mark.className = 'choice-symbol'; mark.textContent = '✕';
      button.append(mark);
    } else {
      button.classList.add('dimmed');
    }
  }
  $('feedback').textContent = isCorrect ? 'Correct! You know your languages ✨' : `Not quite — the correct answer is ${correct}.`;
  $('feedback').classList.add(isCorrect ? 'success' : 'error');
  $('next-button').textContent = index === deck.length - 1 ? 'See my results →' : 'Next word →';
  $('next-button').hidden = false;
}

function nextQuestion() {
  if (!answered) return;
  index++;
  if (index === deck.length) {
    $('question-screen').hidden = true;
    $('result-screen').hidden = false;
    $('round-label').textContent = 'ROUND COMPLETE';
    $('progress-fill').style.width = '100%';
    $('progress-track').setAttribute('aria-valuenow', String(deck.length));
    $('final-score').textContent = score;
    $('result-title').textContent = score >= 9 ? 'Language legend!' : score >= 6 ? 'Nicely done!' : 'Keep exploring!';
    $('result-message').textContent = score >= 9 ? 'Incredible work. Ready for another round?' : score >= 6 ? 'Great instincts! Every new word is a win.' : 'New languages take practice. Try another round!';
  } else {
    renderQuestion();
  }
}

$('next-button').addEventListener('click', nextQuestion);
$('restart-button').addEventListener('click', startGame);
$('new-game-button').addEventListener('click', startGame);
startGame();
