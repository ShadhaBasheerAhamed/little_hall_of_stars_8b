import { LuPrinter } from 'react-icons/lu';
import Sparkle from '../common/Sparkle.jsx';
import { pad2 } from '../../utils/rng.js';
import { CLASS_SIZE, SEALED_ON } from '../../config.js';

// How each strength reads inside the sentence "…for bringing ___ to Class 8B".
const GIFTS = {
  'curious-mind': 'a curious mind',
  'active-listener': 'a careful, listening ear',
  'creative-thinker': 'an imaginative way of thinking',
  'quick-learner': 'an eager, quick-learning spirit',
  'disciplined-mind': 'steady focus',
  'respectful-heart': 'a respectful heart',
  'academic-explorer': 'an explorer’s love of learning',
  'future-technologist': 'a spark for technology',
  'problem-solver': 'patience with puzzles',
  'consistent-learner': 'day-by-day effort',
};

function listify(items) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

// A certificate that celebrates who the student is — it never measures or ranks anything.
export default function Certificate({ student }) {
  const gifts = student.strengths.slice(0, 3).map((id) => GIFTS[id]).filter(Boolean);
  return (
    <main className="cert-page">
      <div className="container">
        <header className="section-head no-print">
          <p className="section-num">A LITTLE EXTRA</p>
          <h1 className="section-title">The Certificate of Being You</h1>
          <p className="lead center">Print it, frame it, stick it on your wall — it's yours.</p>
        </header>

        <section className="cert" aria-label={`Certificate of Being You for ${student.name}`}>
          <div className="cert-border">
            <Sparkle className="cert-corner cert-c1" />
            <Sparkle className="cert-corner cert-c2" />
            <Sparkle className="cert-corner cert-c3" />
            <Sparkle className="cert-corner cert-c4" />
            <p className="cert-brand">The Little Hall of Stars</p>
            <h2 className="cert-title">Certificate of Being You</h2>
            <p className="cert-line">is lovingly presented to</p>
            <p className="cert-name">{student.name}</p>
            <p className="cert-class">Class 8B</p>
            <p className="cert-body">
              for bringing {listify(gifts)} to our classroom, and for being exactly, wonderfully and only yourself.
            </p>
            <p className="cert-body cert-body-soft">
              This certificate doesn't measure anything. Your journey, your efforts and your dreams matter — simply because they are yours.
            </p>
            <div className="cert-foot">
              <div className="cert-sign">
                <span className="hand cert-sig">Your Shadha Mam ❤️</span>
                <span className="cert-sig-line" />
                <span className="cert-small">With lots of appreciation</span>
              </div>
              <div className="cert-seal" aria-hidden="true">
                <Sparkle />
                <span>
                  {pad2(student.rollNumber)}/{CLASS_SIZE}
                </span>
              </div>
              <div className="cert-sign">
                <span className="hand cert-sig">{SEALED_ON}</span>
                <span className="cert-sig-line" />
                <span className="cert-small">Sealed in Class 8B</span>
              </div>
            </div>
          </div>
        </section>

        <p className="center no-print cert-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <LuPrinter aria-hidden="true" /> Print my certificate
          </button>
        </p>
      </div>
    </main>
  );
}
