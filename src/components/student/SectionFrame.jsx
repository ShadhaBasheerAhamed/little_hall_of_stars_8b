import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { Link } from '../../router.jsx';
import { SECTIONS } from '../../data/catalog.js';
import { pad2 } from '../../utils/rng.js';

export default function SectionFrame({ n, base, children }) {
  const sec = SECTIONS[n - 1];
  const prev = n > 1 ? `${base}/s/${n - 1}` : base;
  const next = n < 8 ? `${base}/s/${n + 1}` : `${base}/finale`;
  const prevLabel = n > 1 ? SECTIONS[n - 2].title : 'My little world';
  const nextLabel = n < 8 ? SECTIONS[n].title : 'The last page';
  return (
    <div className={`section sec-${n}`}>
      <div className="container page-enter">
        <header className="section-head">
          <p className="section-num">SECTION {pad2(n)}</p>
          <h1 className="section-title">{sec.title}</h1>
        </header>
        {children}
      </div>
      <nav className="section-nav no-print" aria-label="Section navigation">
        <Link className="btn btn-ghost" to={prev} aria-label={`Back to ${prevLabel}`}>
          <LuArrowLeft aria-hidden="true" /> <span>{n > 1 ? 'Back' : 'Home'}</span>
        </Link>
        <Link className="btn btn-primary" to={next} aria-label={`Next: ${nextLabel}`}>
          <span>{n < 8 ? 'Next' : 'The last page'}</span> <LuArrowRight aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
