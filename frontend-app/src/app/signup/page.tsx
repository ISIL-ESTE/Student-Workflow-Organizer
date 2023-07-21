/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function page() {

  const DATA_SOURCE_URL: string = process.env.DATA_SOURCE_URL as string
  const API_KEY: string = process.env.DATA_API_KEY as string

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm,setPasswordConfirm] = useState('');

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ( !name || !email || !password || !passwordConfirm ) console.log("Missing required data");

    try {
      const res = await fetch(DATA_SOURCE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        body: JSON.stringify({
            name,email,password,passwordConfirm
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
    <div className="bg-gray-100 p-5 flex rounded-2xl shadow-lg max-w-3xl w-8/12 h-1/2">
      <div className="md:w-1/2 px-5">
        <h2 className="text-2xl font-bold text-[#002D74]">Sign Up</h2>
        <p className="text-sm mt-4 text-[#002D74]">Welcome to our plateform</p>
        <form className="mt-6" onSubmit={submitHandler}>

          <div>
            <label className="block text-gray-700">Username</label>
            <input 
                type="text" 
                placeholder="Enter Username" 
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none text-black" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus required/>
          </div>

          <div className="mt-4">
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

          <div className="mt-4">
            <label className="block text-gray-700">Confirme Your Password</label>
            <input 
                type="password" 
                placeholder="Confirm Password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none text-black" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required/>
          </div>

          <button type="submit" className="w-full block bg-blue-500 hover:bg-blue-400 focus:bg-blue-400 text-white font-semibold rounded-lg
                px-4 py-3 mt-6">Sign Up
            </button>
        </form>

        <div className="mt-7 grid grid-cols-3 items-center text-gray-500">
          <hr className="border-gray-500" />
          <hr className="border-gray-500" />
        </div>

        <div className="text-sm flex justify-between items-center mt-3 text-black">
          <p>If you have an account </p>
          <Link href="/login" className="py-2 px-5 ml-3 bg-white border rounded-xl hover:scale-110 duration-300 border-blue-400 text-black">Login</Link>
        </div>
      </div> 

      <div className="w-1/2 h-1/4 md:block hidden">
        <img src="/logo.jpg" className="rounded-2xl" alt="page img" />
      </div>

    </div>
  </section>
  );
};
