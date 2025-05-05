import React, { useState } from 'react'
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom'; 

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 
    const handleLogin = async (e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const response = await login(email, password, setAlert);
            if(response && response.data){
                navigate('/',{replace:true})
            }
        }catch(err){

        }finally{
            setLoading(false);
        }
    };
  return (
    <div className='min-h-screen min-w-screen bg-gradient-to-br from-red-900 to-zinc-800 flex flex-col justify-center items-center'>
        <div className='text-2xl font-bold text-white m-4'>Trade Sim</div>
            <div className='bg-gradient-to-br from-red-800 to-zinc-800 flex flex-col justify-center items-center rounded-md shadow-xl p-6'>
            {alert && <Alert message={alert.message} type={alert.type} />}
                <div className='text-lg font-semibold mb-2 text-white'>
                    Login
                </div>
                <div className='text-sm text-gray-300 mb-4'>
                    Login to Continue
                </div>
                <form onSubmit={handleLogin} className='flex flex-col space-y-2 text-white w-full'>
                <div className='flex flex-col space-y-2 text-white '>
                    <input type="email" 
                    className='border rounded-md px-3 py-2' 
                    placeholder='Email'
                    value={email}
                    onChange={(event)=>{
                        setEmail(event.target.value)
                    }}
                    />
                    <input type="password" 
                    className='border rounded-md px-3 py-2' 
                    placeholder='Password'
                    value={password}
                    onChange={(event)=>{
                        setPassword(event.target.value)
                    }}
                    />
                </div>
                <button 
                type='submit'
                disabled={loading}
                className='bg-gradient-to-br from-blue-600 to-zinc-600 text-white py-2 px-4 rounded-md mt-4'>
                   {loading ? "Logging In..." : "Log In"}
                </button>
                </form>
            </div>
        <div className='text-white hover:text-blue-400 cursor-pointer mt-4' 
        onClick={()=>{navigate("/signup", { replace: true })}}>Don't have an account? Sign Up</div>    
    </div>
  )
}

export default Login

export function Alert({ message, type }) {
    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    return (
        <div className={`p-2 mb-4 rounded-md text-white ${bgColor} text-center`}>
            {message}
        </div>
    );
}