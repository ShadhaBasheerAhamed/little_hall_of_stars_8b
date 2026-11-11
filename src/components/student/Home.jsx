import { LuAward, LuHourglass, LuStar, LuArrowRight, LuFlower2 } from 'react-icons/lu';
import { Link } from '../../router.jsx';
import { SECTIONS } from '../../data/catalog.js';
import { SECTION_ICONS } from '../common/icons.js';
import { pad2 } from '../../utils/rng.js';
import Starfield from '../common/Starfield.jsx';
import { GIFTS } from '../../data/gifts.js';

export default function Home({ student, base }) {
  return (
    <main className="home">
      <Starfield count={18} seed={student.rollNumber * 31 + 3} />
      <div className="container page-enter">
        <section className="hero paper paper--framed" aria-labelledby="hero-title">
          <p className="eyebrow">Class 8B · Roll No. {student.rollNumber}</p>
          <h1 id="hero-title" className="hero-title">Hey, {student.name}!</h1>
          <p className="hero-line">This little corner of the internet is all yours.</p>
          <p className="hero-sub hand">Someone wanted to remind you how special you are.</p>
          <p className="hero-note">{student.welcomeNote}</p>
        </section>

        <nav aria-label="Sections of your little world">
          <h2 className="index-title">Your little world</h2>
          <ol className="index-list">
            {SECTIONS.map((s) => {
              const Icon = SECTION_ICONS[s.n];
              return (
                <li key={s.n}>
                  <Link to={`${base}/s/${s.n}`} className={`index-card ic-${s.n}`}>
                    <span className="index-num" aria-hidden="true">{pad2(s.n)}</span>
                    <span className="index-body">
                      <span className="index-name">{s.title}</span>
                      <span className="index-blurb">{s.blurb}</span>
                    </span>
                    <Icon className="index-icon" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <h2 className="index-title">A few little extras</h2>
        <ul className="extras">
          <li>
            <Link to={`${base}/certificate`} className="extra-card">
              <LuAward aria-hidden="true" />
              <span>
                <strong>The Certificate of Being You</strong>
                <small>For the one and only you</small>
              </span>
            </Link>
          </li>
          <li>
            <Link to={`${base}/capsule`} className="extra-card">
              <LuHourglass aria-hidden="true" />
              <span>
                <strong>A Message to Open Years Later</strong>
                <small>A time capsule, sealed in Class 8B</small>
              </span>
            </Link>
          </li>
          {GIFTS.find((g) => g.rollNumber === student.rollNumber) && (
            <li>
              <Link to={`/gift/${GIFTS.find((g) => g.rollNumber === student.rollNumber).slug}`} className="extra-card">
                <LuFlower2 aria-hidden="true" />
                <span>
                  <strong>Your Children's Day Flower Surprise</strong>
                  <small>A bouquet you can see in your room (AR)</small>
                </span>
              </Link>
            </li>
          )}
        </ul>

        <p className="home-end">
          <Link to={`${base}/finale`} className="btn btn-ghost">
            <LuStar aria-hidden="true" /> The last page <LuArrowRight aria-hidden="true" />
          </Link>
        </p>
      </div>
    </main>
  );
}
