import { LuLayoutList, LuQrCode, LuLogOut, LuStar, LuFlower2, LuGift } from 'react-icons/lu';
import { Link, navigate } from '../../router.jsx';
import { logout } from '../../auth.js';

export default function AdminBar({ current }) {
  return (
    <header className="topbar admin-bar no-print">
      <div className="topbar-in">
        <span className="brand">
          <LuStar aria-hidden="true" /> Teacher's desk
        </span>
        <nav className="admin-nav" aria-label="Teacher navigation">
          <Link to="/admin/dashboard" className={current === 'dashboard' ? 'is-current' : ''} aria-current={current === 'dashboard' ? 'page' : undefined}>
            <LuLayoutList aria-hidden="true" /> <span>Students</span>
          </Link>
          <Link to="/admin/qr" className={current === 'qr' ? 'is-current' : ''} aria-current={current === 'qr' ? 'page' : undefined}>
            <LuQrCode aria-hidden="true" /> <span>QR cards</span>
          </Link>
          <Link to="/admin/gift-cards" className={current === 'gift-cards' ? 'is-current' : ''} aria-current={current === 'gift-cards' ? 'page' : undefined}>
            <LuGift aria-hidden="true" /> <span>Gift Cards</span>
          </Link>
          <Link to="/admin/gifts" className={current === 'gifts' ? 'is-current' : ''} aria-current={current === 'gifts' ? 'page' : undefined}>
            <LuFlower2 aria-hidden="true" /> <span>AR gifts</span>
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              logout();
              navigate('/admin', { replace: true });
            }}
          >
            <LuLogOut aria-hidden="true" /> Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
