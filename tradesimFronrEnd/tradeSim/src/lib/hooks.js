import { useCallback, useEffect, useState } from 'react';
import { fetchMyPortfolio, fetchPrices, session } from '../services/api';

// status: 'signed-out' | 'loading' | 'pending' (account just created) | 'ready' | 'error'
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState(session.token ? 'loading' : 'signed-out');

  const reload = useCallback(async () => {
    if (!session.token) {
      setStatus('signed-out');
      return;
    }
    try {
      setPortfolio(await fetchMyPortfolio());
      setStatus('ready');
    } catch (e) {
      setStatus(e.response?.status === 404 ? 'pending' : 'error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // A new account's portfolio is created asynchronously via Kafka; retry until it exists
  useEffect(() => {
    if (status !== 'pending') return;
    const id = setTimeout(reload, 1500);
    return () => clearTimeout(id);
  }, [status, reload]);

  return { portfolio, setPortfolio, status, reload };
}

export function usePrices(intervalMs = 2000) {
  const [prices, setPrices] = useState({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchPrices();
        if (!cancelled) {
          setPrices(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { prices, failed };
}

// Cash plus every holding valued at the latest price
export function portfolioValue(portfolio, prices) {
  if (!portfolio) return null;
  return Object.entries(portfolio.holdings ?? {}).reduce((total, [symbol, qty]) => {
    const price = Number(prices[symbol]?.p);
    return total + (Number.isFinite(price) ? price * qty : 0);
  }, portfolio.balance);
}
