"use client"
import React, { useEffect } from 'react'
import SideBar from '../components/SideBar'
import MessageMidSection from '../components/MessageMidSection'
import apiClient from '../api/api';
import { useAppSelector } from '../Redux/hooks';
import { useSession } from 'next-auth/react';
import { MySession } from '../Interfaces/interface';

const page = () => {
  const user = useAppSelector((state) => state.user);
  const { data: session } = useSession({
    required: true,
  });

  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };
  
  useEffect(() => {

    // This function will be called when the user leaves the page
    const handleUnload = async () => {
      await UpdateUserStatus("offline");
    };

    // Add the event listener when the component mounts
    window.addEventListener("beforeunload", handleUnload);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const UpdateUserStatus = async (status: string) => {
    const postData = {
      UserId: user.user.Id,
      Status: status,
    };

    try {
      const response = await apiClient.put("/updateStatus", postData, config);
    } catch (error) {
      console.log("Error setting user status");
    }
  };


  return (
    <div className="flex h-screen w-screen font-sans max-w-[2000px] 2xl:mx-auto">
    <SideBar />
    <MessageMidSection/>
    </div>
   

  )
}

export default page