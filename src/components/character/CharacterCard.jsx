import { LuStar } from 'react-icons/lu';
import Sparkle from '../common/Sparkle.jsx';
import { pad2 } from '../../utils/rng.js';
import { CLASS_SIZE } from '../../config.js';

// Section 06 — a collectible trading card. A fictional personality card: no stats, no ranking.
export default function CharacterCard({ student }) {
  return (
    <>
      <article className="char" aria-label={`Character card: ${student.characterName}`}>
        <div className="char-inner">
          <div className="char-top">
            <span>
              No. {pad2(student.rollNumber)} / {CLASS_SIZE}
            </span>
            <span>Class 8B</span>
          </div>
          <div className="char-art" aria-hidden="true">
            <Sparkle className="char-big" />
            <Sparkle className="char-s1" />
            <Sparkle className="char-s2" />
            <Sparkle className="char-s3" />
          </div>
          <h2 className="char-name">{student.characterName}</h2>
          <p className="char-type">{student.characterType}</p>
          <p className="char-label">Special abilities</p>
          <ul className="char-abilities">
            {student.characterAttributes.map((a, i) => (
              <li key={i}>
                <LuStar aria-hidden="true" /> {a}
              </li>
            ))}
          </ul>
          <p className="char-owner hand">{student.name}</p>
          <p className="char-foot">The Little Hall of Stars · a fictional character card</p>
        </div>
      </article>
      <p className="muted center cover-note">Just for fun — a character card is a story, not a score. Every card in the collection is one of a kind.</p>
    </>
  );
}
