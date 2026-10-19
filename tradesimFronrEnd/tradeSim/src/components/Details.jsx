import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import TopBar from './TopBar';
import TickingPrice from './TickingPrice';
import { TradeSide } from './Home';
import { usePortfolio } from '../lib/hooks';
import { errorMessage, fetchPrices, MARKET_WS_URL, placeTrade } from '../services/api';
import { baseAsset, formatPrice, formatQty, formatUsd, isEmptyTrade } from '../lib/format';

const MAX_POINTS = 120;
// Busy coins trade many times per second; the UI samples the stream at this rate
const SAMPLE_MS = 500;

function useLiveTrades(symbol) {
  const [trade, setTrade] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const latest = useRef(null);

  useEffect(() => {
    latest.current = null;
    setTrade(null);
    setHistory([]);

    // Show the last known price right away instead of waiting for the next trade
    fetchPrices()
      .then((data) => {
        const seed = data[symbol];
        if (!isEmptyTrade(seed) && !latest.current) latest.current = seed;
      })
      .catch(() => {});

    const client = new Client({
      // A fresh SockJS per attempt; reusing a closed socket breaks reconnects
      webSocketFactory: () => new SockJS(MARKET_WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/crypto/${symbol.toLowerCase()}`, (message) => {
          try {
            latest.current = JSON.parse(message.body);
          } catch {
            // ignore malformed frames
          }
        });
      },
      onWebSocketClose: () => setConnected(false),
    });
    client.activate();

    let lastSampled = null;
    const sampler = setInterval(() => {
      const t = latest.current;
      if (!t || t === lastSampled) return;
      lastSampled = t;
      setTrade(t);
      setHistory((h) => [...h, { time: t.T || Date.now(), price: Number(t.p) }].slice(-MAX_POINTS));
    }, SAMPLE_MS);

    return () => {
      clearInterval(sampler);
      client.deactivate();
    };
  }, [symbol]);

  return { trade, history, connected };
}

function Details() {
  const symbol = useParams().symbol.toUpperCase();
  const asset = baseAsset(symbol);
  const { portfolio, setPortfolio, status, reload } = usePortfolio();
  const { trade, history, connected } = useLiveTrades(symbol);

  return (
    <>
      <TopBar portfolio={portfolio} status={status} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft size={16} aria-hidden="true" /> All markets
        </Link>

        <div className="mt-3 mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {asset}
              <span className="font-normal text-muted">/USDT</span>
            </h1>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {trade ? <TickingPrice value={trade.p} tabular={false} className="-mx-1" /> : <span className="text-muted">—</span>}
            </p>
          </div>
          <p className="text-sm text-muted">
            <span
              className={`mr-1.5 inline-block size-2 rounded-full ${connected ? 'bg-gain' : 'bg-rule'}`}
              aria-hidden="true"
            />
            {connected ? 'Live from Binance' : 'Connecting to live prices…'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-lg border border-rule bg-surface p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Price</h2>
              {trade && (
                <p className="text-sm text-muted">
                  Last trade <TradeSide sellerInitiated={trade.m} />{' '}
                  <span>{formatQty(trade.q)} {asset}</span>
                </p>
              )}
            </div>
            <PriceChart history={history} />
          </section>

          <OrderTicket
            symbol={symbol}
            asset={asset}
            price={trade ? Number(trade.p) : null}
            portfolio={portfolio}
            status={status}
            onFilled={(res) => {
              setPortfolio((p) => p && { ...p, balance: res.balance, holdings: res.updatedHoldings });
              // The portfolio is updated asynchronously over Kafka; re-read it shortly after
              setTimeout(reload, 1500);
            }}
          />
        </div>
      </main>
    </>
  );
}

function PriceChart({ history }) {
  if (history.length < 2) {
    return (
      <div className="flex h-[360px] items-center justify-center text-sm text-muted">
        Waiting for trades to draw the chart…
      </div>
    );
  }
  return (
    <div className="h-[360px]">
      <ResponsiveContainer>
        <AreaChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2747d9" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#2747d9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#dfe6ef" vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            minTickGap={40}
            tick={{ fill: '#5b6b85', fontSize: 12 }}
            stroke="#cad4e1"
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={formatPrice}
            width={88}
            tick={{ fill: '#5b6b85', fontSize: 12 }}
            stroke="#cad4e1"
          />
          <Tooltip
            formatter={(value) => [formatPrice(value), 'Price']}
            labelFormatter={(t) => new Date(t).toLocaleTimeString()}
            contentStyle={{ border: '1px solid #cad4e1', borderRadius: 6, fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#2747d9"
            strokeWidth={2}
            fill="url(#priceFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function OrderTicket({ symbol, asset, price, portfolio, status, onFilled }) {
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (status === 'signed-out') {
    return (
      <aside className="rounded-lg border border-rule bg-surface p-5">
        <h2 className="font-semibold">Trade {asset}</h2>
        <p className="mt-1 text-sm text-muted">Log in to buy and sell with your virtual cash.</p>
        <Link
          to="/login"
          className="mt-4 block rounded-md bg-cobalt py-2.5 text-center font-semibold text-white hover:bg-cobalt-dark"
        >
          Log in
        </Link>
      </aside>
    );
  }

  const qty = Number(quantity);
  const validQty = quantity !== '' && Number.isFinite(qty) && qty > 0;
  const held = portfolio?.holdings?.[symbol] ?? 0;
  const cash = portfolio?.balance ?? 0;
  const estimate = validQty && price ? qty * price : null;

  const problem = !validQty
    ? null
    : side === 'buy' && estimate > cash
      ? `That costs ${formatUsd(estimate)}, but you have ${formatUsd(cash)} in cash.`
      : side === 'sell' && qty > held
        ? `You hold ${formatQty(held)} ${asset}.`
        : null;

  const setMax = () => {
    if (side === 'sell') setQuantity(String(held));
    else if (price) setQuantity(String(Math.floor((cash / price) * 1e6) / 1e6));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await placeTrade(side, symbol, qty);
      setResult({ ok: true, text: res.message });
      setQuantity('');
      onFilled(res);
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err, 'The trade did not go through. Try again.') });
    } finally {
      setSubmitting(false);
    }
  };

  const sideLabel = side === 'buy' ? 'Buy' : 'Sell';

  return (
    <aside className="rounded-lg border border-rule bg-surface p-5">
      <h2 className="font-semibold">Trade {asset}</h2>

      <div className="mt-4 grid grid-cols-2 rounded-md border border-rule p-1 text-sm font-semibold" role="group" aria-label="Order side">
        {['buy', 'sell'].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => {
              setSide(s);
              setResult(null);
            }}
            className={`rounded py-1.5 ${
              side === s ? (s === 'buy' ? 'bg-gain text-white' : 'bg-loss text-white') : 'text-muted hover:text-ink'
            }`}
          >
            {s === 'buy' ? 'Buy' : 'Sell'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <label className="block text-sm font-medium">
          Quantity
          <div className="mt-1 flex rounded-md border border-rule focus-within:border-cobalt">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="num w-full rounded-l-md px-3 py-2 font-normal focus:outline-none"
            />
            <span className="flex items-center pr-2 text-muted">{asset}</span>
            <button type="button" onClick={setMax} className="border-l border-rule px-3 text-cobalt hover:bg-paper">
              Max
            </button>
          </div>
        </label>

        <dl className="space-y-1.5 text-sm">
          <Row label={side === 'buy' ? 'Estimated cost' : 'Estimated proceeds'} value={estimate ? formatUsd(estimate) : '—'} strong />
          <Row label="Cash available" value={formatUsd(cash)} />
          <Row label={`${asset} you hold`} value={formatQty(held)} />
        </dl>

        {problem && <p className="text-sm text-loss">{problem}</p>}

        <button
          type="submit"
          disabled={!validQty || !!problem || !price || submitting}
          className={`w-full rounded-md py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            side === 'buy' ? 'bg-gain' : 'bg-loss'
          }`}
        >
          {submitting ? `${sideLabel === 'Buy' ? 'Buying' : 'Selling'}…` : `${sideLabel} ${asset}`}
        </button>
        <p className="text-xs text-muted">Orders fill at the latest market price when you submit.</p>

        <p aria-live="polite" className={`text-sm ${result?.ok ? 'text-gain' : 'text-loss'}`}>
          {result?.text}
        </p>
      </form>
    </aside>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`num ${strong ? 'font-semibold' : ''}`}>{value}</dd>
    </div>
  );
}

export default Details;
