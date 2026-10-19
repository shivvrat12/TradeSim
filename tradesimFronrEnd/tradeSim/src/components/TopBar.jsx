import { Link, useNavigate } from 'react-router-dom';
import { session } from '../services/api';
import { formatUsd } from '../lib/format';

function TopBar({ portfolio, status }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    session.clear();
    navigate('/login');
  };

  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight">TradeSim</span>
          <span className="hidden text-sm text-muted sm:inline">Paper trading with virtual money</span>
        </Link>

        {status === 'signed-out' ? (
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link to="/login" className="rounded-md px-3 py-1.5 hover:bg-paper">
              Log in
            </Link>
            <Link to="/signup" className="rounded-md bg-cobalt px-3 py-1.5 text-white hover:bg-cobalt-dark">
              Create account
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            {portfolio && (
              <span>
                <span className="text-muted">Cash </span>
                <span className="font-semibold">{formatUsd(portfolio.balance)}</span>
              </span>
            )}
            <span className="hidden text-muted md:inline">{session.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-rule px-3 py-1.5 font-medium hover:bg-paper"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
