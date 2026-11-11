import { LuHouse, LuLogOut, LuStar } from 'react-icons/lu';
import { Link } from '../../router.jsx';

export default function TopBar({ base, atHome, onExit, exitLabel = 'Exit' }) {
  return (
    <header className="topbar no-print">
      <div className="topbar-in">
        {atHome ? (
          <span className="brand">
            <LuStar aria-hidden="true" /> The Little Hall of Stars
          </span>
        ) : (
          <Link to={base} className="topbar-link">
            <LuHouse aria-hidden="true" /> My little world
          </Link>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={onExit}>
          <LuLogOut aria-hidden="true" /> {exitLabel}
        </button>
      </div>
    </header>
  );
}
