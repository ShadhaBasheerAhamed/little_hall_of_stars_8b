import { LuArrowRight } from 'react-icons/lu';
import Starfield from '../common/Starfield.jsx';
import Sparkle from '../common/Sparkle.jsx';

export default function Welcome({ student, onEnter }) {
  return (
    <main className="welcome">
      <Starfield count={48} seed={student.rollNumber * 13 + 5} />
      <div className="welcome-inner page-enter">
        <Sparkle className="welcome-star" />
        <p className="eyebrow">Class 8B · Roll No. {student.rollNumber}</p>
        <h1 className="welcome-title">Hey, {student.name}!</h1>
        <p className="welcome-line">This little corner of the internet is all yours.</p>
        <p className="welcome-sub">Someone wanted to remind you how special you are.</p>
        <p className="welcome-note">{student.welcomeNote}</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onEnter} autoFocus>
          Step inside <LuArrowRight aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
