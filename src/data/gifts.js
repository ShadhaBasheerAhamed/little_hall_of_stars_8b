// Children's Day AR flower gift — one record per student, built from the central roster so names
// are never repeated by hand. Names are shown exactly as provided; only the slug is simplified.
import { BASE_STUDENTS } from './students.js';

export const GIFT_YEAR = 2026;
export const GIFT_MODEL_PATH = 'assets/models/bouquet.glb'; // relative to index.html (works on any static host)
export const GIFT_CLOSING = 'With love, Your Shadha Mam ❤️';

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Short lines that sit under "Hey <name>!" — assigned round-robin so neighbours differ.
const OPENERS = [
  'Something special has bloomed just for you!',
  'A little bouquet is waiting just for you!',
  'Look what grew in the garden of Class 8B!',
  'These flowers were picked with you in mind!',
  'A surprise has blossomed, and it has your name on it!',
  'Fresh from our classroom garden, just for you!',
];

// Positive, age-appropriate wishes. The first is the one from the brief; the rest keep the same spirit.
const MESSAGES = [
  'Never stop dreaming, never stop exploring, and never stop being curious. Your imagination can create a beautiful future. Keep shining and keep smiling!',
  'Your questions, your ideas and your kindness make our classroom brighter. Keep wondering, keep learning, and keep believing in the wonderful things you can do!',
  'Today is all about you! Stay curious, stay kind, and let your imagination lead the way. The world is waiting for what you will create.',
  'You are growing into someone amazing, one curious step at a time. Keep exploring, keep smiling, and never forget how bright your ideas are!',
  'May your days be full of laughter, new discoveries and big dreams. Keep asking, keep trying, and keep being the wonderful you!',
  'Every great story begins with curiosity, and yours is just beginning. Dream big, work happily, and keep shining your own special light!',
  'Thank you for the smiles you bring to Class 8B. Keep imagining, keep exploring, and keep believing that your dreams can bloom!',
];

export const GIFTS = BASE_STUDENTS.map((s, i) => {
  const first = s.name.trim().split(/\s+/)[0];
  return {
    id: `gift-${String(s.rollNumber).padStart(2, '0')}`,
    rollNumber: s.rollNumber,
    name: s.name, // exact, as provided
    slug: slugify(s.name),
    greeting: `Hey ${first}! 🌸`,
    opener: OPENERS[i % OPENERS.length],
    message: MESSAGES[i % MESSAGES.length],
  };
});

// Safety net: every student must have a distinct URL.
if (new Set(GIFTS.map((g) => g.slug)).size !== GIFTS.length) {
  throw new Error('Gift slugs must be unique');
}

export const findGift = (slug) => GIFTS.find((g) => g.slug === slug) || null;

/** The address a QR code points to: <site>#/gift/<slug>. `site` is the deployed address. */
export const giftUrl = (site, gift) => `${String(site).trim().split('#')[0]}#/gift/${gift.slug}`;
