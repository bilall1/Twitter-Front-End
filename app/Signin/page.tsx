"use client";
//React
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
//Images
import Image from "next/image";
import logo from "../assets/twitter.png";
import googleimg from "../assets/google.png";

export default function Login() {
  //Constants
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  //Functions

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function customLogin(e: { preventDefault: () => void }) {
    e.preventDefault();

    const postData = {
      Email: formData.email,
      Password: formData.password,
    };

    const status = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
      callbackUrl: "/",
    });
    {
      status ? router.push("/") : console.log("");
    }
  }

  async function googleLogin() {
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="h-screen flex items-center justify-center  ">
      <div className="rounded-md py-8 px-12 bg-slate-200">
        <Image className="h-14 w-14 mr-2" src={logo} alt="" />
        <h1 className="text-2xl font-bold">Sign In to Twitter</h1>
        <form action="">
          <label>
            <br></br>
            <input
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              type="email"
              name="email"
              placeholder="Email Here"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <br></br>
          <br></br>

          <input
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            type="password"
            name="password"
            placeholder="Password Here"
            value={formData.password}
            onChange={handleChange}
          />
          <br></br>
          <br></br>
          <input
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            type="submit"
            value="Login"
            onClick={customLogin}
          />
        </form>
        <br></br>
        <button
          className=" flex px-6 py-2 border rounded-full hover:bg-gray-200 font-sans   "
          onClick={googleLogin}
        >
          <Image className="h-8 w-8 mr-2" src={googleimg} alt="" />
          {/* <img src={logo} alt="Button Icon" className="h-4 w-4 mr-2" /> */}
          Sign in with Google
        </button>
        <br></br>
        Don't have an account?
        <Link className="text-blue-500" href="/Signup">
          Signup
        </Link>
      </div>
    </div>
  );
}

function useEffectuseEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}
