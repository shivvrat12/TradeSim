import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchBalance } from '../services/api';
import api from '../services/api';

const CryptoDetail = () => {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1.0);
  const stompRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [textInAlert, setTextInAlert] = useState("");
  const setShowALertWithTiming = () => {
    setShowAlert(true);
    setTimeout(()=>{
      setShowAlert(false);
    },4000);
  };

  const handleLoginClick = () => {
    if (userBalance === 'Log In') {
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!symbol) return;

    const token = localStorage.getItem('jwtToken');

    // Initialize WebSocket
    const socket = new SockJS(`http://localhost:8080/ws${token ? `?token=${token}` : ''}`);
    const stomp = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('WebSocket connected');
        const topic = `/topic/crypto/${symbol.toLowerCase()}`;
        console.log(`Subscribing to ${topic}`);
        stomp.subscribe(topic, (message) => {
          try {
            const trade = JSON.parse(message.body);
            console.log(`Received trade on ${topic}:`, trade);
            const point = {
              time: new Date(trade.T).toLocaleTimeString(),
              price: parseFloat(trade.p),
            };
            setData(trade);
            setHistory((h) => {
              const next = [...h, point];
              return next.length > 30 ? next.slice(next.length - 30) : next;
            });
            setError(null);
          } catch (e) {
            console.error(`Error parsing message on ${topic}:`, e, message.body);
            setError('Invalid data received from server');
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setError('Failed to connect to price updates. Please try refreshing the page.');
        if (frame.headers?.message?.includes('Unauthorized')) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            api
              .post('/api/auth/v1/refresh', { refreshToken })
              .then((response) => {
                const newAccessToken = response.data.accessToken;
                localStorage.setItem('jwtToken', newAccessToken);
                stomp.deactivate();
                const newSocket = new SockJS(`http://localhost:8080/ws?token=${newAccessToken}`);
                stomp.webSocketFactory = () => newSocket;
                stomp.activate();
              })
              .catch(() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
              });
          } else {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          }
        }
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to price updates. Please try refreshing the page.');
      },
      reconnectDelay: 5000,
    });

    // Set a timeout to show an error if no data is received
    const timeout = setTimeout(() => {
      if (!data && !error) {
        setError('No recent trade data received. The market may be inactive or the connection is down.');
      }
    }, 30000); // 30 seconds

    // Fetch balance if authenticated
    if (token) {
      fetchBalance()
        .then((balance) => {
          setUserBalance(parseFloat(balance).toFixed(2));
        })
        .catch((error) => {
          console.error('Error fetching balance:', error);
          setUserBalance('Log In');
        });
    } else {
      setUserBalance('Log In');
    }

    stompRef.current = stomp;
    stomp.activate();

    return () => {
      clearTimeout(timeout);
      if (stompRef.current) {
        stompRef.current.deactivate();
        console.log('WebSocket disconnected');
      }
    };
  }, [symbol, navigate]);

  const handleBuy = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken');
    if (!data) {
      alert('No price data available');
      setLoading(false);
      return;
    }
    if (!token) {
      alert('Please login to buy any token');
      setLoading(false);
      navigate('/login');
      return;
    }
    if (quantity <= 0) {
      setLoading(false);
      alert('Quantity must be positive');
      return;
    }
    try {
      const response = await api.post('http://localhost:8083/api/trade/buy', {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data.p),
        quantity: quantity,
      });
      if (token) {
        fetchBalance()
          .then((balance) => {
            setUserBalance(parseFloat(balance).toFixed(2));
          })
          .catch((error) => {
            console.error('Error fetching balance:', error);
            setUserBalance('Error');
          });
      } else {
        setUserBalance('Log In');
      }
      setLoading(false);
      setShowALertWithTiming();
      setTextInAlert(`🔥 ${symbol}: ${response.data.message}`);
      setQuantity(1.0);
    } catch (error) {
      console.error('Buy error:', error);
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error occurred';
        setShowALertWithTiming();
        setTextInAlert(`❌ ${errorMessage}`);
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      }
    }
  };

  const handleSell = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwtToken');
    if (!data) {
      alert('No price data available');
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      alert('Please login before selling any stock.');
      navigate('/login');
      return;
    }
    if (quantity <= 0) {
      setLoading(false);
      alert('Quantity must be positive');
      return;
    }
    try {
      const response = await api.post('http://localhost:8083/api/trade/sell', {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data.p),
        quantity: quantity,
      });
      if (token) {
        fetchBalance()
          .then((balance) => {
            setUserBalance(parseFloat(balance).toFixed(2));
          })
          .catch((error) => {
            console.error('Error fetching balance:', error);
            setUserBalance('Error');
          });
      } else {
        setUserBalance('Log In');
      }
      setLoading(false);
      setShowALertWithTiming();
      setTextInAlert(`🔥${symbol}: ${response.data.message}`);
      setQuantity(1.0);
    } catch (error) {
      console.error('Sell error:', error);
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || error.message || 'Unknown error occurred';
        setShowALertWithTiming();
        setTextInAlert(`❌ ${errorMessage}`);
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-sm bg-zinc-700/40 border border-zinc-600 rounded-lg p-3 text-sm text-gray-300">
          <p className="font-semibold text-white">{`Time: ${label}`}</p>
          <p>{`Price: $${payload[0].value.toFixed(4)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 to-zinc-800 text-white p-6">
       <div className='flex items-center justify-center'>
       {showAlert && (
          <div className='text-lg font-semibold text-white mb-2'>
            {textInAlert}
          </div>
        )}
        </div>
      <div className="flex content-center justify-center">
        <h1 className="text-3xl font-bold mb-10 text-center md:text-xl">🚀 {symbol} Live Price</h1>
        <div
          className="m-2 absolute top-6 right-6 p-2 backdrop-blur-sm bg-zinc-700/40 border border-zinc-600 rounded-2xl shadow-lg cursor-pointer"
          onClick={handleLoginClick}
        >
          ${userBalance}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Graph Card */}
        <div className="lg:col-span-2 backdrop-blur-sm bg-zinc-700/40 border border-zinc-600 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Price Chart</h2>
          <div className="w-full h-[400px]">
            {history.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="time"
                    minTickGap={20}
                    tick={{ fill: '#ccc', fontSize: 12 }}
                    stroke="#ccc"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#ccc', fontSize: 12 }}
                    stroke="#ccc"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="none"
                    fill="url(#priceGradient)"
                    fillOpacity={0.3}
                  />
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Waiting for price data...</p>
            )}
          </div>
        </div>

        {/* Trade Data Card */}
        <div className="backdrop-blur-sm bg-zinc-700/40 border border-zinc-600 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Trade Details</h2>
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : data ? (
            <div className="text-sm text-gray-300">
              <div className="flex items-center justify-between mb-2">
                <p className="mb-1">
                  Price:{' '}
                  <span className="text-white font-semibold">${parseFloat(data.p).toFixed(4)}</span>
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    data.m
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {data.m ? (
                    <>
                      <ArrowDownRight size={16} />
                      Sell
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} />
                      Buy
                    </>
                  )}
                </span>
              </div>
              <p className="mb-1">
                Quantity:{' '}
                <span className="text-white font-semibold">{parseFloat(data.q).toFixed(4)}</span>
              </p>
              <p className="mb-4">
                Trade Time:{' '}
                <span className="text-white font-semibold">
                  {new Date(data.T).toLocaleTimeString()}
                </span>
              </p>
              <div className="space-y-4">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                  className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-700"
                  placeholder="Enter quantity"
                />
                <div className="flex gap-4 text-white">
                  Amount needed to make this purchase: {(quantity * data.p).toFixed(2)}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleBuy}
                    disabled={!data || loading}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      data && !loading
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                        : 'bg-zinc-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Buying...' : 'Buy'}
                  </button>
                  <button
                    onClick={handleSell}
                    disabled={!data || loading}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      data && !loading
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                        : 'bg-zinc-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Selling...' : 'Sell'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Waiting for price data...</p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default CryptoDetail;