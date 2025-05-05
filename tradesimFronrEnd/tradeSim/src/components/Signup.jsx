import React, { useState } from 'react'
import { signUp } from '../services/api';
import { Alert } from './Login';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSignup = async (e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            if(password.match(confirmPassword)){
            const response = await signUp(name, email, password, setAlert);
            if(response && response.data){
                setTimeout(()=>{
                    navigate('/login')
                }, 2000
                )
            }
            }else{
                setAlert({
                    message:"Password and Confirm Password do not match",
                    type:"error"
                })
                setTimeout(()=>{
                    setAlert(null)
                },3000)
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
                <div className='text-lg font-semibold mb-2 text-white'>
                    Sign Up
                </div>
                <div className='text-sm text-gray-300 mb-4'>
                    Create an Account
                </div>
                <form onSubmit={handleSignup} className='flex flex-col space-y-2 text-white w-full'>
                <div className='flex flex-col space-y-2 text-white '>
                    <input type="text" 
                    className='border rounded-md px-3 py-2' 
                    placeholder='Name'
                    value={name}
                    onChange={(event)=>{
                        setName(event.target.value)
                    }}
                    />
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
                    <input type="password" 
                    className='border rounded-md px-3 py-2' 
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(event)=>{
                        setConfirmPassword(event.target.value)
                    }}
                    />
                </div>
                <button 
                type='submit'
                disabled={loading}
                className='bg-gradient-to-br from-blue-600 to-zinc-600 text-white py-2 px-4 rounded-md mt-4'>
                   {loading ? "Loading..." : "Sign Up"}
                </button>
                </form>
            </div>
            <div className='text-white hover:text-blue-400 cursor-pointer mt-4'
            onClick={()=>navigate("/login",{replace: true})}>Already have an account? Log In</div>
            {alert && <Alert message={alert.message} type={alert.type} />}
    </div>
  )
}

export default Signup;