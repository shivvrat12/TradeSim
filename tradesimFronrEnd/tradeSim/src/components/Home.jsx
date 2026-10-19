import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import TopBar from './TopBar';
import TickingPrice from './TickingPrice';
import { portfolioValue, usePortfolio, usePrices } from '../lib/hooks';
import {
  baseAsset,
  formatPrice,
  formatQty,
  formatSignedUsd,
  formatUsd,
  isEmptyTrade,
  STARTING_BALANCE,
} from '../lib/format';

function Home() {
  const { portfolio, status } = usePortfolio();
  const { prices, failed } = usePrices();
  const navigate = useNavigate();

  const markets = Object.entries(prices)
    .filter(([, trade]) => !isEmptyTrade(trade))
    .sort(([a], [b]) => a.localeCompare(b));
  const holdings = portfolio?.holdings ?? {};

  return (
    <>
      <TopBar portfolio={portfolio} status={status} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
          <p className="mt-1 mb-4 text-sm text-muted">Live prices from Binance. Pick a coin to see its chart and trade it.</p>

          {failed && markets.length === 0 ? (
            <Notice>Can't load prices. Check that market-service is running on port 8080.</Notice>
          ) : markets.length === 0 ? (
            <Notice>Waiting for the first prices from Binance…</Notice>
          ) : (
            <div className="overflow-hidden rounded-lg border border-rule bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left text-muted">
                    <th className="px-4 py-2.5 font-medium">Coin</th>
                    <th className="px-4 py-2.5 text-right font-medium">Price</th>
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Last trade</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">You hold</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map(([symbol, trade]) => (
                    <tr
                      key={symbol}
                      onClick={() => navigate(`/details/${symbol}`)}
                      className="cursor-pointer border-b border-rule/60 last:border-0 hover:bg-paper"
                    >
                      <td className="px-4 py-3">
                        <Link to={`/details/${symbol}`} className="font-semibold" onClick={(e) => e.stopPropagation()}>
                          {baseAsset(symbol)}
                        </Link>
                        <span className="text-muted">/USDT</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        <TickingPrice value={trade.p} />
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <TradeSide sellerInitiated={trade.m} />
                        <span className="num ml-2 text-muted">{formatQty(trade.q)}</span>
                      </td>
                      <td className="num hidden px-4 py-3 text-right md:table-cell">
                        {holdings[symbol] ? formatQty(holdings[symbol]) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="lg:pt-[4.25rem]">
          <PortfolioPanel portfolio={portfolio} status={status} prices={prices} />
        </aside>
      </main>
    </>
  );
}

function PortfolioPanel({ portfolio, status, prices }) {
  if (status === 'signed-out') {
    return (
      <Panel>
        <h2 className="text-lg font-semibold">Practice without the risk</h2>
        <p className="mt-1 text-sm text-muted">
          Create an account to get {formatUsd(STARTING_BALANCE)} in virtual cash and trade real-time crypto prices.
        </p>
        <Link
          to="/signup"
          className="mt-4 block rounded-md bg-cobalt py-2.5 text-center font-semibold text-white hover:bg-cobalt-dark"
        >
          Create account
        </Link>
        <Link to="/login" className="mt-2 block text-center text-sm font-medium text-cobalt hover:underline">
          I already have an account
        </Link>
      </Panel>
    );
  }
  if (status === 'loading' || status === 'pending') {
    return <Panel><p className="text-sm text-muted">{status === 'pending' ? 'Setting up your portfolio…' : 'Loading your portfolio…'}</p></Panel>;
  }
  if (status === 'error' || !portfolio) {
    return <Panel><p className="text-sm text-loss">Can't load your portfolio. Check that portfolio-service is running on port 8082.</p></Panel>;
  }

  const total = portfolioValue(portfolio, prices);
  const change = total - STARTING_BALANCE;
  const holdings = Object.entries(portfolio.holdings ?? {});

  return (
    <Panel>
      <h2 className="text-sm font-medium text-muted">Portfolio value</h2>
      <p className="mt-1 text-3xl font-bold tracking-tight">{formatUsd(total)}</p>
      <p className={`mt-1 text-sm font-medium ${change >= 0 ? 'text-gain' : 'text-loss'}`}>
        {formatSignedUsd(change)} ({((change / STARTING_BALANCE) * 100).toFixed(2)}%) since you started
      </p>

      <dl className="mt-5 border-t border-rule pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Cash</dt>
          <dd className="num font-medium">{formatUsd(portfolio.balance)}</dd>
        </div>
      </dl>

      <h3 className="mt-5 text-sm font-semibold">Holdings</h3>
      {holdings.length === 0 ? (
        <p className="mt-1 text-sm text-muted">No coins yet. Pick one from the market list to make your first trade.</p>
      ) : (
        <ul className="mt-2 divide-y divide-rule/60 text-sm">
          {holdings.map(([symbol, qty]) => {
            const price = Number(prices[symbol]?.p);
            return (
              <li key={symbol}>
                <Link to={`/details/${symbol}`} className="flex items-baseline justify-between py-2 hover:text-cobalt">
                  <span>
                    <span className="font-semibold">{baseAsset(symbol)}</span>
                    <span className="num ml-2 text-muted">{formatQty(qty)}</span>
                  </span>
                  <span className="num font-medium">{Number.isFinite(price) ? formatUsd(price * qty) : formatPrice(NaN)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function TradeSide({ sellerInitiated }) {
  // Binance's "m" flag: buyer was the maker, so the trade was a market sell
  return sellerInitiated ? (
    <span className="inline-flex items-center gap-0.5 font-medium text-loss">
      <ArrowDownRight size={14} aria-hidden="true" /> Sell
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 font-medium text-gain">
      <ArrowUpRight size={14} aria-hidden="true" /> Buy
    </span>
  );
}

function Panel({ children }) {
  return <div className="rounded-lg border border-rule bg-surface p-5">{children}</div>;
}

function Notice({ children }) {
  return <div className="rounded-lg border border-rule bg-surface px-4 py-8 text-center text-sm text-muted">{children}</div>;
}

export default Home;
