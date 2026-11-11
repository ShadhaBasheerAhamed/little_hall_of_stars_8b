import { Link } from '../../router.jsx';
import { LuHouse } from 'react-icons/lu';
import Sparkle from '../common/Sparkle.jsx';
import Starfield from '../common/Starfield.jsx';
import { CLASS_SIZE } from '../../config.js';

// The closing page: the whole class as one sky. No names, no order of merit — only "find yours".
export default function Finale({ student, base }) {
  return (
    <main className="finale">
      <Starfield count={36} seed={2911} color="var(--gold-soft)" />
      <div className="container page-enter">
        <div className="sky29" role="img" aria-label={`${CLASS_SIZE} stars, one for each student in Class 8B`}>
          {Array.from({ length: CLASS_SIZE }, (_, i) => (
            <Sparkle key={i} className={`sky29-star${i + 1 === student.rollNumber ? ' is-yours' : ''}`} />
          ))}
        </div>
        <p className="finale-central">
          You don't have to be the best in the class to be special. You are special simply because you are you. Your journey, your efforts and your dreams matter.
        </p>
        <h1 className="finale-title">
          <span>{CLASS_SIZE} Students.</span> <span>{CLASS_SIZE} Little Worlds.</span> <span>One Beautiful Classroom.</span>
        </h1>
        <p className="finale-line">Class 8B — Always a Special Chapter. ❤️</p>
        <p className="finale-sign hand">Your Shadha Mam</p>
        <p className="center">
          <Link to={base} className="btn btn-ghost">
            <LuHouse aria-hidden="true" /> Back to my little world
          </Link>
        </p>
      </div>
    </main>
  );
}
