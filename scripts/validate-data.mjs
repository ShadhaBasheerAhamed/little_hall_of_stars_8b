// Validates the student database. Run:  npm run validate   (or: node scripts/validate-data.mjs)
import { BASE_STUDENTS, ROSTER, buildAll, findByPin } from '../src/data/students.js';
import { STRENGTHS } from '../src/data/catalog.js';

const problems = [];
const fail = (msg) => problems.push(msg);

const EXPECTED_NAMES = [
  'Aarya', 'Amanda Pauline raj', 'Annlin delshia', 'Ashlin danshia', 'Aswin raj', 'Deivamithra', 'Dharshan',
  'Fharoy gabriel', 'Gautham Karthick', 'Kairav', 'Keshna', 'Mahalingam', 'Mahitha', 'Mukul', 'Nehashmitra',
  'Niralya', 'Nivyanth', 'Rahul Antony', 'Ram Virath', 'Rohit manas', 'Roshannah', 'Rositha', 'Sai Ashwinth',
  'Sarvesh', 'Selva sidhhanya', 'Sri sharini selvan', 'Suriya dharshini', 'Tarun sanjiv', 'Varshini',
];

const students = buildAll({});
if (students.length !== 29) fail(`Expected 29 students, found ${students.length}`);

students.forEach((s, i) => {
  if (s.name !== EXPECTED_NAMES[i]) fail(`Name mismatch at roll ${i + 1}: "${s.name}" vs "${EXPECTED_NAMES[i]}"`);
  if (s.rollNumber !== i + 1) fail(`Roll number mismatch for ${s.name}`);
  if (s.pin !== String(823 + i)) fail(`PIN mismatch for ${s.name}: ${s.pin}`);
});

const textFields = [
  'welcomeNote', 'introduction', 'quote', 'appreciationMessage', 'letterToFutureSelf', 'magazineHeadline',
  'magazineSubtitle', 'magazineDescription', 'characterName', 'characterType', 'encouragementLetter', 'finalMessage', 'timeCapsule',
];
for (const s of students) {
  for (const f of textFields) if (!s[f] || !String(s[f]).trim()) fail(`${s.name}: empty ${f}`);
  if (!Array.isArray(s.strengths) || s.strengths.length < 4 || s.strengths.length > 6) fail(`${s.name}: needs 4–6 strengths`);
  if (new Set(s.strengths).size !== s.strengths.length) fail(`${s.name}: duplicate strengths`);
  s.strengths.forEach((id) => { if (!STRENGTHS[id]) fail(`${s.name}: unknown strength ${id}`); });
  if (s.characterAttributes.length !== 5) fail(`${s.name}: needs exactly 5 character attributes`);
  if (s.magazineEditorials.length < 3 || s.magazineEditorials.length > 4) fail(`${s.name}: needs 3–4 editorial headlines`);
  if (/\{name\}|\{mam\}|undefined|\[object/.test(JSON.stringify(s))) fail(`${s.name}: unfilled placeholder`);
  if (!s.encouragementLetter.endsWith('Someone believed in you enough to create this little world just for you. Never forget that.')) fail(`${s.name}: encouragement letter must end with the required line`);
  if (!s.letterToFutureSelf.startsWith('Dear Future Me,')) fail(`${s.name}: future letter opening`);
}

// content rules
const FORBIDDEN = [/\bmarks?\b/i, /\bgrades?\b/i, /\brank(ing|ed)?\b/i, /\btopper\b/i, /\bscores?\b/i, /\bteacher\b/i, /\bbeloved\b/i, /\b(he|she|his|hers?|him)\b/i, /\bbetter than\b/i, /\bthan (the )?(others|everyone|anyone)\b/i];
for (const s of students) {
  for (const f of [...textFields, 'characterAttributes', 'magazineEditorials']) {
    const val = Array.isArray(s[f]) ? s[f].join(' ') : s[f];
    for (const re of FORBIDDEN) if (re.test(val)) fail(`${s.name}: ${f} matches forbidden pattern ${re} -> "${(val.match(re) || [])[0]}"`);
  }
}

// uniqueness across students
const unique = (field, get = (s) => s[field]) => {
  const seen = new Map();
  for (const s of students) {
    const v = get(s);
    if (seen.has(v)) fail(`Duplicate ${field}: "${String(v).slice(0, 60)}…" (${seen.get(v)} and ${s.name})`);
    seen.set(v, s.name);
  }
};
['introduction', 'appreciationMessage', 'letterToFutureSelf', 'magazineHeadline', 'characterName', 'encouragementLetter', 'finalMessage', 'timeCapsule'].forEach((f) => unique(f));
unique('strength set', (s) => [...s.strengths].sort().join(','));
unique('editorials', (s) => s.magazineEditorials.join('|'));
unique('attributes', (s) => s.characterAttributes.join('|'));
unique('dOpen paragraph', (s) => s.encouragementLetter.split('\n\n')[1]);
unique('appreciation opener', (s) => s.appreciationMessage.split(/[,.—]/)[0].replace(s.name, '{n}'));

// PIN login for every student
for (const s of students) {
  const hit = findByPin(students, s.pin);
  if (!hit || hit.rollNumber !== s.rollNumber) fail(`PIN ${s.pin} does not open ${s.name}`);
}
if (findByPin(students, '999') || findByPin(students, '')) fail('Wrong PIN unexpectedly matched');
if (BASE_STUDENTS.length !== ROSTER.length) fail('Roster/content length mismatch');

if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n - ` + problems.join('\n - '));
  process.exit(1);
}
console.log(`OK — ${students.length} students validated: names exact, PINs ${students[0].pin}–${students[28].pin} all unlock the right profile, content complete and unique.`);
const words = (s) => JSON.stringify(s).split(/\s+/).length;
console.log(`Average content per student: ~${Math.round(students.reduce((a, s) => a + words(s), 0) / students.length)} words.`);
