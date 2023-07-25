'use client'

import React, { useState } from "react"
import logo from "../assets/twitter.png"
import googleimg from "../assets/google.png"
import { signIn } from "next-auth/react"
import Link from "next/link"

import Image from "next/image"

import apiClient from "../api/api"



export default function signup() {

    const [formData, setFormData] = useState({ email: '', password: '', thirdParty: false, fname: '', lname: '' ,d_o_b: ''});

    const [signUpMessage, setSignUpMessage] = useState('');


    const handleChange = (e: { target: { name: any; value: any } }) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e: any) => {

        e.preventDefault();

        try {

            const postData = {
                "Email": formData.email,
                "Password": formData.password,
                "ThirdParty": formData.thirdParty,
                "FirstName":formData.fname,
                "LastName":formData.lname,
                "D_o_b":formData.d_o_b
            };

            const response = await apiClient.post('/createUser', postData);
            console.log('Response:', response.data);
            // Handle the response as needed

            setSignUpMessage("Sucessfully Signed Up.")


        } catch (error) {
            console.error('Error:', error);
            // Handle the error as needed
        }
    }


    return <div className="h-screen flex items-center justify-center  ">
        <div className="rounded-md py-8 px-12  bg-slate-200">
            <Image className="h-14 w-14 mr-2" src={logo} alt="" />
            <h1 className="text-2xl font-bold">Sign Up for Twitter</h1>

            <form action="/" onSubmit={handleSubmit}>

                <br></br>
                <input className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                    type="name" name="fname" placeholder="First Name" value={formData.fname} onChange={handleChange} />

                <br></br>
                <br></br>
                <input className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                    type="name" name="lname" placeholder="Last Name" value={formData.lname} onChange={handleChange} />

                <br></br>
                <br></br>
                <input className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                    type="date"  name="d_o_b"  value={formData.d_o_b} onChange={handleChange} />

                <label>
                    <br></br>
                    <input className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                        type="email" name="email" placeholder="Email Here" value={formData.email} onChange={handleChange} />
                </label>
                <br></br>
                <br></br>

                <input className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    type="password" name="password" placeholder="Password Here" value={formData.password} onChange={handleChange} />
                <br></br>
                <br></br>
                <input className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    type="submit" value="Sign Up" />

            </form>
            <br></br>
            {signUpMessage}

            <br></br>
            Already Registered?
            <Link className="text-blue-500" href="/Signin">
                Signin
            </Link>


        </div>


    </div>

}

