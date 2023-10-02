"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/twitter.png";
import home from "../assets/home.png";
import message from "../assets/message.png";
import profile from "../assets/profile.png";
import { signOut } from "next-auth/react";
import signout from "../assets/signout.png";
import Profile from "../Profile/page";

export default function SideBar() {
  return (
    <div className="md:w-1/12 lg:w-1/3 relative">
      <div className="ml-3 sm:block lg:hidden md:hidden fixed bottom-0 z-30 bg-white w-11/12 py-3">
        <div className="flex justify-between">
          <Link
            href="/"
            className="pl-3 pt-2 flex transform transition-all duration-500 ease-in-out hover:scale-105 "
          >
            <Image className="lg:h-8 lg:w-8 h-6 w-6 mr-2" src={home} alt="" />
            <span className="hidden lg:inline-block lg:text-2xl">Home</span>
          </Link>

          <Link
            href="../Messages"
            className="pl-3 pt-2 flex transform transition-all duration-500 ease-in-out hover:scale-105"
          >
            <Image
              className="lg:h-8 lg:w-8 h-6 w-6 mr-2"
              src={message}
              alt=""
            />
            <span className="hidden lg:inline-block lg:text-2xl">Messages</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="pl-3 pt-2 flex transform transition-all duration-500 ease-in-out hover:scale-105"
          >
            <Image
              className="lg:h-7 lg:w-7 h-6 w-6 mr-2"
              src={signout}
              alt="Signout Icon"
            />
            <span className="hidden lg:inline-block lg:text-2xl">Sign Out</span>
          </button>

          <Link
            href="../Profile"
            className="pl-3 pt-2 flex transform transition-all duration-500 ease-in-out hover:scale-105 "
          >
            <Image
              className="lg:h-8 lg:w-8 h-6 w-6 mr-2"
              src={profile}
              alt=""
            />
            <span className="hidden lg:inline-block lg:text-2xl">Profile</span>
          </Link>
        </div>
      </div>

      <div className="hidden lg:block md:block md:w-1/12 lg:w-1/3 py-5 mr-10 lg:mr-1 md:mr-1">
        <div className="lg:px-20 md:px-5 sm:px-2 h-full fixed ">
          <div>
            <Image
              className="lg:h-20 lg:w-20 h-12 w-12 mr-10"
              src={logo}
              alt="Twitter Logo"
            />
          </div>

          <div className="flex flex-col h-5/6 justify-between">
            <div className="flex flex-col">
              <Link
                href="/"
                className="pl-3 pt-5 flex transform transition-all duration-500 ease-in-out hover:scale-105 "
              >
                <Image
                  className="lg:h-8 lg:w-8 h-6 w-6 mr-2"
                  src={home}
                  alt=""
                />
                <span className="hidden lg:inline-block lg:text-2xl">Home</span>
              </Link>

              <Link
                href="../Messages"
                className="pl-3 pt-5 flex transform transition-all duration-500 ease-in-out hover:scale-105"
              >
                <Image
                  className="lg:h-8 lg:w-8 h-6 w-6 mr-2"
                  src={message}
                  alt=""
                />
                <span className="hidden lg:inline-block lg:text-2xl">
                  Messages
                </span>
              </Link>

              <button
                onClick={() => signOut()}
                className="pl-3 pt-5 flex transform transition-all duration-500 ease-in-out hover:scale-105"
              >
                <Image
                  className="lg:h-7 lg:w-7 h-6 w-6 mr-2"
                  src={signout}
                  alt="Signout Icon"
                />
                <span className="hidden lg:inline-block lg:text-2xl">
                  Sign Out
                </span>
              </button>
            </div>

            <div>
              <div className="pl-3 pt-3 flex flex-col">
                <Link
                  href="../Profile"
                  className="pb-2 flex transform transition-all duration-500 ease-in-out hover:scale-105"
                >
                  <Image
                    className="lg:h-9 lg:w-9 h-6 w-6 mr-2"
                    src={profile}
                    alt=""
                  />
                  <span className="hidden lg:inline-block lg:text-2xl">
                    Profile
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
