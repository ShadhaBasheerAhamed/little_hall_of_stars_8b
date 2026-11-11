// Turns each student's hand-written content (content-a/b/c.js) into a complete record.
// Letters that share an overall structure (future-self letter, "open when", final note, time capsule)
// are assembled from several different variants plus each student's own personal lines,
// so no two students receive the same paragraph.
import { CODE, STRENGTHS } from './catalog.js';

const MAM = 'Shadha Mam';

// first-person ("me") and second-person ("you") wordings used inside the future-self letter
const PHRASE = {
  'curious-mind': ['my curious mind', 'your curious mind'],
  'active-listener': ['the way I listen carefully', 'the way you listen carefully'],
  'creative-thinker': ['my imaginative way of thinking', 'your imaginative way of thinking'],
  'quick-learner': ['how eagerly I pick up new ideas', 'how eagerly you pick up new ideas'],
  'disciplined-mind': ['the discipline I am building', 'the discipline you built'],
  'respectful-heart': ['my respectful, caring heart', 'your respectful, caring heart'],
  'academic-explorer': ['my love of exploring every subject', 'your love of exploring every subject'],
  'future-technologist': ['my interest in computers and technology', 'your interest in computers and technology'],
  'problem-solver': ['my patience with tricky problems', 'your patience with tricky problems'],
  'consistent-learner': ['my habit of learning a little every day', 'your habit of learning a little every day'],
};

const FUTURE_LETTERS = [
  (c) => `Dear Future Me,

I hope you still remember the curious student you once were. I hope you still ask questions, explore new ideas and find joy in learning. ${c.dream}

Right now, in Class 8B, I'm learning that ${c.me1} and ${c.me2} are worth being proud of. If you are reading this years from now, please don't let ${c.you1} or ${c.you2} fade.

I hope you are brave enough to dream big, and gentle enough with yourself when things go wrong. Mistakes are not the end of the story — they are how every good story gets better.

I hope you are still kind. I hope you are still confident. And I hope you still believe in the person who wrote this letter, because that person believed in you.

With all my heart,
${c.name}`,

  (c) => `Dear Future Me,

It's me — ${c.name}, from Class 8B. I'm writing to you from a time when there is still so much to learn, and I want you to know that I'm excited about it.

Today I'm proud of ${c.me1}. I'm also proud of ${c.me2}. I hope ${c.you1} and ${c.you2} are still part of you, even if everything else has changed.

${c.dream}

Here is what I want you to remember: you don't have to know everything. Learning never finishes, and that is the best part. Dream big, even when it feels a little silly. Try new things, explore what interests you, and let yourself be a beginner again.

Be kind to others, and be kind to yourself too. Believe in what you can do. Whatever you are doing right now, you have my permission to be proud of how far you've come.

Your past self,
${c.name}`,

  (c) => `Dear Future Me,

If you are holding this letter, a lot of time has passed — and I wonder what you have become. I hope you have kept some of what makes me, me: ${c.you1}, and ${c.you2}.

I want to tell you a few things before the years take over.

First, dream big. Bigger than feels reasonable. Second, don't be afraid of mistakes; they are just lessons wearing a disguise. Third, keep learning, because learning is a lifelong journey, not just a school subject. Fourth, explore whatever makes you curious. And last, stay kind.

${c.dream}

Believe in your abilities. I already do.

Love,
${c.name}`,

  (c) => `Dear Future Me,

Hello from Class 8B! I'm sitting here wondering what you are doing right now. Are you still curious? Still exploring? Still finding joy in learning something new?

I hope so. ${c.me1} and ${c.me2} are things I'm learning to value in myself, and I'd hate for you to forget them.

${c.dream}

When things get hard, please remember that being afraid of mistakes only stops you from learning. Try anyway. Dream big. Explore the things that interest you, even if they seem unusual. Stay kind to others, confident in yourself and curious about the world, and believe that you can do far more than you think.

You have so much more to learn and so much more to give.

Cheering for you always,
${c.name}`,

  (c) => `Dear Future Me,

There is something I want you to remember: I was already wonderful when I wrote this. Not because I had done anything special — just because I was me, with ${c.me1} and ${c.me2}.

${c.dream}

I hope you are still a learner. I hope you still explore what interests you, whether it's a subject, a skill or a wild idea. I hope you give yourself permission to make mistakes, because every one of them teaches you something. I hope you are gentle with people, and that you trust your own abilities.

Dream big, Future Me. The world is large enough for it.

With hope,
${c.name}`,

  (c) => `Dear Future Me,

I'm writing this on an ordinary day in Class 8B, which is exactly why I want you to keep it. Ordinary days are where ${c.me1} and ${c.me2} get built.

I hope you are still asking questions. I hope you have learned that being curious is never silly, and that it's perfectly okay not to know. ${c.dream}

Please don't be afraid to try things that might not work. Dream big. Explore. Take your interests seriously. Be generous and kind, and believe in your abilities, because you are growing into someone wonderful.

Learning is a journey that never really ends, and I hope you are enjoying every step of it.

Yours, always,
${c.name}`,
];

const DOUBT_BODIES = [
  "Here is what I know to be true. You are capable — more capable than your doubts want you to believe. You are learning at your own pace, and your pace is exactly right for your journey. Mistakes are not proof that you aren't good enough; they are part of how every learner grows. And please, never measure your path against anyone else's. Your journey belongs only to you.",
  "A few things I'd like you to hold on to today. First: you can do hard things — you have been doing them for a long time. Second: there is no deadline on becoming who you are meant to be, so move at the speed that suits you. Third: a mistake is a guide, not a judge. And finally, your potential is far bigger than any doubt you are having right now. Don't compare your story with anyone else's; it was never meant to look like theirs.",
  "When doubt gets loud, try remembering this: being capable doesn't mean never struggling. Learning is full of slow days and fast days, and both are completely normal. You can make mistakes and still be wonderful. Your potential is much larger than the worry sitting on your shoulders today. And you never have to keep up with anyone else — you only have to be kind to the person you are today.",
  "Let me remind you of a few things you may have forgotten. You are capable of far more than you think. You are allowed to learn slowly, quickly or somewhere in between. Mistakes don't define you — they teach you. What you can become is bigger than any doubt. And the road you are on is yours alone, so there is no need to compare it with anyone else's.",
];

const FINAL_BODIES = [
  "Thank you for being part of this wonderful classroom. Every day, your presence, your efforts and your willingness to learn make a difference.\n\nKeep asking questions. Keep exploring. Keep being the wonderful person you are.\n\nThe world has so many things waiting for you.\n\nAnd remember, your story is only getting started.",
  "I want you to know that this classroom is better with you in it. Keep your curiosity switched on, keep trying even when it's hard, and keep treating people the way you do.\n\nThere is so much waiting for you out there — and I'm so happy I got to be a small part of the beginning.\n\nYour story is only getting started.",
  "A class is made of people, and each of you has left a little light behind in this one. Yours is a bright one.\n\nPlease keep exploring, keep asking and keep believing in yourself. The world is wide, and it has room for everything you want to become.\n\nThese are only the first few pages of your story.",
  "Thank you for the days, the questions and the effort. They have mattered more than you may realise.\n\nGo gently, go curious and go bravely. There are so many wonderful things ahead of you.\n\nAnd remember: your story is only getting started.",
];

const CAPSULES = [
  (c) => `Dear ${c.name},

If you are opening this years from now, I hope you are smiling. When you open this again, remember the little kid who had big dreams — the one in Class 8B who asked questions, listened carefully and believed the world had room for them.

${c.dream}

Whatever has happened since, that kid is still inside you, cheering you on.`,
  (c) => `Hello ${c.name},

A lot of time has passed since you were in Class 8B. Before you read any further, take a slow breath and remember who you were then: someone with big dreams and a curious heart.

${c.dream}

I hope you remember that you were always enough, exactly as you were.`,
  (c) => `Dear ${c.name},

This little capsule was sealed in Class 8B, where so much of your story began. I hope it finds you well, and I hope it finds you happy.

Remember the little kid who had big dreams. ${c.dream}

Whatever you have become, I am proud of the beginning.`,
];

const WELCOMES = [
  (n) => `I made this little world just for you, ${n}. Take your time exploring it — there are no right or wrong answers, and nobody is checking.`,
  (n) => `Come in, ${n} — this space has been waiting for you. Wander through it slowly, and let yourself smile a little.`,
  (n) => `${n}, every page here was written with you in mind. Open them in any order you like, and take whatever you need from them.`,
  (n) => `Hello, ${n}. ${MAM} put this together because you deserve a place that celebrates you. Make yourself comfortable.`,
];

const QUOTES = [
  'Every star shines differently. Your way of learning, listening and growing makes you special.',
  'No two stars are the same, and that is exactly why the sky is so beautiful.',
  "You don't have to shine like anyone else. You only have to shine like you.",
  'Small steps, taken with curiosity, can lead to very big places.',
  'Your story is still being written — and you hold the pen.',
  'The best kind of growth happens quietly, a little at a time.',
  'A curious heart will always find something wonderful to learn.',
];

const MAG_DESCRIPTIONS = [
  (n) => `A special Class 8B edition, made just for ${n} — because every story deserves a cover.`,
  (n) => `One cover, one star, one very bright future: the ${n} edition.`,
  (n) => `Written with appreciation, printed with imagination: this issue belongs to ${n}.`,
];

export function composeStudent(row, a) {
  const [rollNumber, pin, name] = row;
  const fill = (s) => s.replace(/\{name\}/g, name).replace(/\{mam\}/g, MAM);
  const i = rollNumber - 1;
  const strengths = a.str.split(' ').map((k) => CODE[k]);
  const [s1, s2] = strengths;
  const letterCtx = {
    name,
    dream: fill(a.dream),
    me1: PHRASE[s1][0],
    me2: PHRASE[s2][0],
    you1: PHRASE[s1][1],
    you2: PHRASE[s2][1],
  };
  const doubtOpen = fill(a.dOpen);
  const capCtx = { name, dream: fill(a.dream) };

  return {
    rollNumber,
    pin: String(pin),
    name,
    classLabel: '8B',
    welcomeNote: WELCOMES[i % WELCOMES.length](name),
    introduction: fill(a.intro),
    quote: QUOTES[i % QUOTES.length],
    appreciationMessage: fill(a.app),
    strengths,
    letterToFutureSelf: FUTURE_LETTERS[i % FUTURE_LETTERS.length](letterCtx),
    magazineHeadline: a.hl,
    magazineSubtitle: a.sub,
    magazineDescription: MAG_DESCRIPTIONS[i % MAG_DESCRIPTIONS.length](name),
    magazineEditorials: a.ed.slice(),
    characterName: a.cn,
    characterType: a.ct,
    characterAttributes: a.at.split('|'),
    encouragementLetter: `Dear ${name},\n\n${doubtOpen}\n\n${DOUBT_BODIES[i % DOUBT_BODIES.length]}\n\nSomeone believed in you enough to create this little world just for you. Never forget that.`,
    finalMessage: `${fill(a.fin)}\n\n${FINAL_BODIES[(i + Math.floor(i / 4)) % FINAL_BODIES.length]}`,
    timeCapsule: CAPSULES[i % CAPSULES.length](capCtx),
  };
}

export const strengthTitle = (id) => (STRENGTHS[id] ? STRENGTHS[id].title : id);
