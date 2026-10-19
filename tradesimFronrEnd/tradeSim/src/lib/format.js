// Every new account starts with this much virtual cash (see portfolio-service UserCreatedListener)
export const STARTING_BALANCE = 1_000_000;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(value) {
  const n = Number(value);
  return Number.isFinite(n) ? usd.format(n) : '—';
}

// Coins range from ~$80,000 (BTC) to ~$0.00001 (SHIB), so small prices keep significant digits
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1) return usd.format(n);
  return '$' + Number(n.toPrecision(4)).toString();
}

export function formatQty(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 8 }) : '—';
}

export function formatSignedUsd(value) {
  return (value >= 0 ? '+' : '−') + usd.format(Math.abs(value));
}

export function baseAsset(symbol) {
  return symbol.replace(/USDT$/, '');
}

export function isEmptyTrade(trade) {
  return !trade || trade.p === undefined;
}
