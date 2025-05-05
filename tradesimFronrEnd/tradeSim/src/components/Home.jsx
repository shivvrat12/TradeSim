import React, {useEffect, useState} from 'react';
import { fetchCryptoData,fetchPortfolio } from '../services/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


function Home() {
    const [apiData, setApiData] = useState({});
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const token = localStorage.getItem('jwtToken');
    const [profile,setProfile] = useState("");
    const handleLoginClick = () => {
        if(profile === "Log In"){
          navigate("/login");
        }else{
          setShowDialog(true);
        }
    };
    const handleLogout = () => {
      localStorage.clear();
      setProfile("Log In");
      setShowDialog(false);
    }

    useEffect(() => {
      const fetchData = async () => {
          const data = await fetchCryptoData();
          setApiData(data);
      };
      
      const fetchPort = async () => {
      const email = localStorage.getItem('email');
      if(!token || !email){
        setProfile("Log In");
      }else{
        try{
          const res = await fetchPortfolio(email);
          const data = await res;
          setPortfolio(data);
          setProfile(`Hello ${data.email}`);
        }catch(err){
          console.error("Error fetching portfolio", err);
        }
      }
    }
    fetchData();
    fetchPort();
  }, []);
  

      const entries = Object.entries(apiData).filter(([__dirname, value]) => value !==null);

      return (
        <div className='min-h-screen w-full bg-gradient-to-br from-red-900 to-zinc-800 text-white p-6 '>
          
          <div className='flex items-center justify-between mb-5'>
          <h1 className='text-3xl font-bold'>🚀 Live Crypto Trades</h1>
          <div className='relative'>
          <div className='text-white border-1 p-2 rounded-xl bg-zinc-800 hover:cursor-pointer'
            onClick={handleLoginClick}
          >{profile}</div>
          {showDialog && portfolio && (
            <div className='absolute right-0 mt-2 bg-zinc-800 p-4 rounded-xl shadow-xl w-80 z-80'>
              <h2 className='text-lg font-bold mb-2'>Profile Info</h2>
              <p className='mb-1'><strong>Email:</strong> {portfolio.email}</p>
              <p className="mb-1"><strong>Balance:</strong> ${portfolio.balance.toFixed(2)}</p>
              <div className='mb-3'>
                <strong>
                  Holding:
                </strong>
                <ul className='list-disc list-inside text-sm max-h-32 overflow-y-auto'>
                  {Object.entries(portfolio.holdings).map(([symbol, amount]) => (
                    <li key={symbol}>{symbol}: {amount}</li>
                  ))}
                </ul>
              </div>
              <div className='flex justify-between'>
                <button className='bg-red-500 px-3 py-1 rounded-lg hover:bg:red-700 text-sm' onClick={handleLogout}>🚪 Logout</button>
                <button className='bg-gray-600 px-3 py-1 rounded-lg hover:bg-gray-700 text-sm' onClick={()=> setShowDialog(false)}>❌ Close</button>
              </div>
            </div>
          )}
          </div>
          </div>
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            {entries.map(([symbol, info]) => {
              const isSell = info.m;
      
              return (
                <div
                  key={symbol}
                  onClick={() => navigate(`/details/${symbol}`)}
                  className='backdrop-blur-sm bg-zinc-700/40 hover:bg-sky-700 border border-zinc-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <h2 className='text-xl font-bold'>{symbol}</h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                        isSell
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {isSell ? (
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
      
                  <div className='text-sm text-gray-300'>
                    <p className='mb-1'>
                      Price:{' '}
                      <span className='text-white font-semibold'>
                        ${parseFloat(info.p).toFixed(4)}
                      </span>
                    </p>
                    <p className='mb-1'>
                      Quantity:{' '}
                      <span className='text-white font-semibold'>
                        {parseFloat(info.q).toFixed(4)}
                      </span>
                    </p>
                    <p className='text-xs text-gray-500'>Trade ID: {info.t}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
}

export default Home