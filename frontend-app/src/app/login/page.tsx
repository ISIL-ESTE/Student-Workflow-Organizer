/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function page() {

  const DATA_SOURCE_URL: string = process.env.DATA_SOURCE_URL as string
  const API_KEY: string = process.env.DATA_API_KEY as string

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ( !email || !password ) console.log("Missing required data");

    try {
      const res = await fetch(DATA_SOURCE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        body: JSON.stringify({
            email,password
        })
      })
      const data = await res.json()
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  };


  return (
    <section className="border-red-500 bg-gray-200 min-h-screen flex items-center justify-center">
    <div className="bg-gray-100 p-5 flex rounded-2xl shadow-lg max-w-3xl">
      <div className="md:w-1/2 px-5">
        <h2 className="text-2xl font-bold text-[#002D74]">Login</h2>
        <p className="text-sm mt-4 text-[#002D74]">Welcome to our plateform</p>
        <p className="text-sm mt-4 text-[#002D74]">If you have an account, please login</p>
        <form className="mt-6" onSubmit={submitHandler}>
          <div>
            <label className="block text-gray-700">Email Address</label>
            <input 
                type="email" 
                placeholder="Enter Email Address" 
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none text-black" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus required/>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Password</label>
            <input 
                type="password" 
                placeholder="Enter Password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none text-black" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required/>
          </div>

          <div className="text-right mt-2">
            <Link href="#" className="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700">Forgot Password?</Link>
          </div>

          <button type="submit" className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                px-4 py-3 mt-6">Log In</button>
        </form>

        <div className="mt-7 grid grid-cols-3 items-center text-gray-500">
          <hr className="border-gray-500" />
          <p className="text-center text-sm">OR</p>
          <hr className="border-gray-500" />
        </div>

        <button className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-105 duration-300 ">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="w-6 h-6" viewBox="0 0 48 48">
          <defs>
            <path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
          </defs>
          <clipPath id="b">
            <use xlinkHref="#a" overflow="visible" />
          </clipPath>
          <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
          <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
          <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
          <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
        </svg>
          <span className="ml-4 text-black">Login with Google</span>
        </button>

        <button className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-105 duration-300 " 
        onClick={() => {window.location.href="https://github.com/login/oauth/authorize?client_id=Iv1.6d6db037d6c883d9&redirect_url=http://localhost:4000/api/v1/auth/github/callback?path=/&scope=user:yassine.boujrada@gmail.com"}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
           </svg>
          <span className="ml-4 text-black">Login with Github</span>
        </button>

        <div className="text-sm flex justify-between items-center mt-3 text-black">
          <p>If you dont have an account </p>
          <Link href="/signup" className="py-2 px-5 ml-3 bg-white border rounded-xl hover:scale-110 duration-300 border-blue-400 text-black">Sign Up</Link>
        </div>
      </div>

      <div className="w-1/2 h-1/4 md:block hidden">
        <img src="/logo.jpg" className="rounded-2xl" alt="page img" />
      </div>

    </div>
  </section>
  );
};
