// Central student database.
//   1. ROSTER            — roll number, PIN and name (names are kept exactly as provided).
//   2. content-a/b/c.js  — hand-written content for each student.
//   3. composer.js       — assembles the full record (letters, capsule, etc.).
//   4. overrides.json    — teacher edits exported from the admin panel (publish by rebuilding).
//   5. localStorage      — edits made in the admin panel on this device (see hooks/useContent.js).
import { composeStudent } from './composer.js';
import { CONTENT_A } from './content-a.js';
import { CONTENT_B } from './content-b.js';
import { CONTENT_C } from './content-c.js';
import FILE_OVERRIDES from './overrides.json' with { type: 'json' };

// [rollNumber, PIN, name]
export const ROSTER = [
  [1, 823, 'Aarya'],
  [2, 824, 'Amanda Pauline raj'],
  [3, 825, 'Annlin delshia'],
  [4, 826, 'Ashlin danshia'],
  [5, 827, 'Aswin raj'],
  [6, 828, 'Deivamithra'],
  [7, 829, 'Dharshan'],
  [8, 830, 'Fharoy gabriel'],
  [9, 831, 'Gautham Karthick'],
  [10, 832, 'Kairav'],
  [11, 833, 'Keshna'],
  [12, 834, 'Mahalingam'],
  [13, 835, 'Mahitha'],
  [14, 836, 'Mukul'],
  [15, 837, 'Nehashmitra'],
  [16, 838, 'Niralya'],
  [17, 839, 'Nivyanth'],
  [18, 840, 'Rahul Antony'],
  [19, 841, 'Ram Virath'],
  [20, 842, 'Rohit manas'],
  [21, 843, 'Roshannah'],
  [22, 844, 'Rositha'],
  [23, 845, 'Sai Ashwinth'],
  [24, 846, 'Sarvesh'],
  [25, 847, 'Selva sidhhanya'],
  [26, 848, 'Sri sharini selvan'],
  [27, 849, 'Suriya dharshini'],
  [28, 850, 'Tarun sanjiv'],
  [29, 851, 'Varshini'],
];

const AUTHORED = new Map([...CONTENT_A, ...CONTENT_B, ...CONTENT_C].map((a) => [a.n, a]));

export const BASE_STUDENTS = ROSTER.map((row) => {
  const authored = AUTHORED.get(row[0]);
  if (!authored) throw new Error(`Missing content for roll number ${row[0]}`);
  return composeStudent(row, authored);
});

export { FILE_OVERRIDES };

/** Merge order: built-in content < overrides.json < local (admin) edits. */
export function buildAll(local = {}) {
  return BASE_STUDENTS.map((b) => ({
    ...b,
    ...(FILE_OVERRIDES[b.rollNumber] || {}),
    ...(local[b.rollNumber] || {}),
  }));
}

export function findByPin(students, pin) {
  const clean = String(pin).trim();
  return students.find((s) => s.pin === clean) || null;
}
