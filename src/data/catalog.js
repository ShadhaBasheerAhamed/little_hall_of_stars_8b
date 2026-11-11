// Shared catalogs: the eight sections and the ten "superpower" strengths.
export const SECTIONS = [
  { n: 1, title: 'A Little World of You', blurb: 'Your very own identity card' },
  { n: 2, title: 'What Makes You Special', blurb: 'A note written just for you' },
  { n: 3, title: 'Your Superpowers', blurb: 'The qualities that shine in you' },
  { n: 4, title: 'A Letter to Your Future Self', blurb: 'Words to carry into tomorrow' },
  { n: 5, title: "You're the Cover Star!", blurb: 'Your own magazine cover' },
  { n: 6, title: 'If You Were a Character…', blurb: 'Your collectible card' },
  { n: 7, title: 'Open When You Doubt Yourself', blurb: 'A letter for the harder days' },
  { n: 8, title: 'One Last Thing…', blurb: 'A final word from Shadha Mam' },
];

// Each strength has three one-line wordings; a student sees one of them (so cards never read identically).
export const STRENGTHS = {
  'curious-mind': {
    title: 'Curious Mind',
    lines: ["Always ready to ask 'why?' and 'what if?'", 'Wonders about how the world works.', "Treats questions as the doorway to everything you'll learn."],
  },
  'active-listener': {
    title: 'Active Listener',
    lines: ['Pays attention in a way that makes learning richer.', 'Listens carefully, and understands more because of it.', 'Gives every lesson your full attention.'],
  },
  'creative-thinker': {
    title: 'Creative Thinker',
    lines: ['Finds fresh ways to look at an idea.', 'Brings imagination to everything you explore.', "Turns a 'what if' into something new."],
  },
  'quick-learner': {
    title: 'Quick Learner',
    lines: ['Picks up new ideas with real enthusiasm.', 'Takes in new ideas and makes them your own.', 'Learns with a spark that is lovely to see.'],
  },
  'disciplined-mind': {
    title: 'Disciplined Mind',
    lines: ['Brings focus and care to your work.', 'Follows through with steady effort.', 'Builds strong habits that will carry you far.'],
  },
  'respectful-heart': {
    title: 'Respectful Heart',
    lines: ['Treats people and ideas with care.', 'Shows a respect that makes our classroom kinder.', 'Listens to instructions, and to people, with respect.'],
  },
  'academic-explorer': {
    title: 'Academic Explorer',
    lines: ['Enjoys exploring subjects and seeing how they connect.', 'Treats every subject as a place worth exploring.', 'Loves finding out a little more each time.'],
  },
  'future-technologist': {
    title: 'Future Technologist',
    lines: ['Curious about computers and the world they are shaping.', 'Shows a real spark for Computer Science.', 'Imagines what technology could become, and how to build it.'],
  },
  'problem-solver': {
    title: 'Problem Solver',
    lines: ['Approaches tricky questions with patience.', 'Keeps going until the puzzle makes sense.', 'Looks for a way through, one step at a time.'],
  },
  'consistent-learner': {
    title: 'Consistent Learner',
    lines: ['Shows up, tries, learns and grows, day after day.', 'Learns a little every day, and it all adds up.', 'Brings steady effort that keeps getting stronger.'],
  },
};

export const STRENGTH_IDS = Object.keys(STRENGTHS);

// Short codes used only in the authored content files, to keep them readable.
export const CODE = {
  cm: 'curious-mind',
  al: 'active-listener',
  ct: 'creative-thinker',
  ql: 'quick-learner',
  dm: 'disciplined-mind',
  rh: 'respectful-heart',
  ae: 'academic-explorer',
  ft: 'future-technologist',
  ps: 'problem-solver',
  cl: 'consistent-learner',
};
