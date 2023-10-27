"use client"
import React, { Dispatch, SetStateAction, useContext, useEffect } from 'react'
import SideBar from '../components/SideBar'
import MessageMidSection from '../components/MessageMidSection'
import apiClient from '../api/api';
import { useAppSelector } from '../Redux/hooks';
import { useSession } from 'next-auth/react';
import { MySession } from '../Interfaces/interface';
import MyContext from '../context/userContext';

interface UserState {
  Id: number;
  Email: string;
  Password: string;
  ThirdParty: boolean;
  D_o_b: string;
  FirstName: string;
  LastName: string;
  Profile: string;
}

interface MyContextType {
  userState: UserState;
  setUserState: Dispatch<SetStateAction<UserState>>;
}


const page = () => {
 // const user = useAppSelector((state) => state.user);

 const context = useContext(MyContext);
 const { userState, setUserState } = context as MyContextType;



  const { data: session } = useSession({
    required: true,
  });

  const userEmail = session?.user?.email || "invalid";


  useEffect(() => {
    console.log("called")
    if (userEmail != "invalid") {
  
  console.log("Request preceded")
      apiClient
      .get("/getUser", {
        params: {
          Email: userEmail,
        },
      })
      .then((response) => 
       //get data from database
       
       setUserState((prevState: any) => ({
        ...prevState, 
        Email: response.data.user.Email,
        Id: response.data.user.Id,
      }))  
      );
  
  
     
  
    }
  }, [userEmail]);

  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: userState?.ThirdParty,
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
      UserId: userState?.Id,
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