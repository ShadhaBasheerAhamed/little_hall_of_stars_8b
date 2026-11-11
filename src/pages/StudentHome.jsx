import { useEffect, useState } from 'react';
import { Redirect } from '../router.jsx';
import { SITE_NAME } from '../config.js';
import TopBar from '../components/common/TopBar.jsx';
import Welcome from '../components/student/Welcome.jsx';
import Home from '../components/student/Home.jsx';
import SectionFrame from '../components/student/SectionFrame.jsx';
import LittleWorld from '../components/student/LittleWorld.jsx';
import Appreciation from '../components/student/Appreciation.jsx';
import Superpowers from '../components/student/Superpowers.jsx';
import FutureLetter from '../components/letters/FutureLetter.jsx';
import MagazineCover from '../components/magazine/MagazineCover.jsx';
import CharacterCard from '../components/character/CharacterCard.jsx';
import Envelope from '../components/letters/Envelope.jsx';
import FinalNote from '../components/student/FinalNote.jsx';
import Certificate from '../components/student/Certificate.jsx';
import TimeCapsule from '../components/student/TimeCapsule.jsx';
import Finale from '../components/student/Finale.jsx';

const SECTION_VIEWS = {
  1: LittleWorld,
  2: Appreciation,
  3: Superpowers,
  4: FutureLetter,
  5: MagazineCover,
  6: CharacterCard,
  7: Envelope,
  8: FinalNote,
};

const WELCOMED_KEY = (roll) => `lhos.welcomed.${roll}`;

function wasWelcomed(roll) {
  try {
    return sessionStorage.getItem(WELCOMED_KEY(roll)) === '1';
  } catch {
    return false;
  }
}

/**
 * One student's whole experience. `base` is the route prefix ("/me" for a student,
 * "/admin/preview/<roll>" for the teacher's preview) and `rest` the part after it.
 */
export default function StudentHome({ student, base, rest, onExit, exitLabel = 'Exit', preview = false }) {
  const [welcomed, setWelcomed] = useState(() => preview || wasWelcomed(student.rollNumber));

  useEffect(() => {
    document.title = `${student.name} · ${SITE_NAME}`;
  }, [student.name]);

  const enter = () => {
    try {
      sessionStorage.setItem(WELCOMED_KEY(student.rollNumber), '1');
    } catch {
      /* ignore */
    }
    setWelcomed(true);
  };

  const parts = rest.split('/').filter(Boolean);
  const atHome = parts.length === 0;

  let view;
  if (atHome) {
    if (!welcomed) return <Welcome student={student} onEnter={enter} />;
    view = <Home student={student} base={base} />;
  } else if (parts[0] === 's' && /^[1-8]$/.test(parts[1] || '')) {
    const n = Number(parts[1]);
    const View = SECTION_VIEWS[n];
    view = (
      <SectionFrame n={n} base={base}>
        <View student={student} />
      </SectionFrame>
    );
  } else if (parts[0] === 'certificate') {
    view = <Certificate student={student} base={base} />;
  } else if (parts[0] === 'capsule') {
    view = <TimeCapsule student={student} base={base} />;
  } else if (parts[0] === 'finale') {
    view = <Finale student={student} base={base} />;
  } else {
    return <Redirect to={base} />;
  }

  return (
    <div className="student-app">
      <TopBar base={base} atHome={atHome} onExit={onExit} exitLabel={exitLabel} />
      {preview && (
        <p className="preview-banner no-print" role="status">
          Preview of {student.name}'s page — this is exactly what they will see.
        </p>
      )}
      {view}
    </div>
  );
}
