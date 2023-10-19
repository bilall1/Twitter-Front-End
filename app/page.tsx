"use client";
//React
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
//Redux
import { useAppSelector, useAppDispatch } from "./Redux/hooks";
import { fetchUsers } from "./Redux/features/user/userSlice";
//Components
import HomePage from "./components/HomePage";
import { useSocketHook } from "./hooks/useSocketHook";
import apiClient from "./api/api";
import { MySession } from "./Interfaces/interface";
import { requestForToken } from "./Firebase/token";
import { getMessaging, onMessage } from "firebase/messaging";
import { onMessageListener } from "./Firebase/firebase";
import toast, { Toaster } from 'react-hot-toast';


type FirebaseNotification = {
  notification?: {
    title?: string;
    body?: string;
  };
};


export default function Home() {
  //Redux
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };


  const [notification, setNotification] = useState({ title: '', body: '' });

  onMessageListener()
    .then((payload) => {
      const data: FirebaseNotification = payload as FirebaseNotification;
      setNotification({
        title: data?.notification?.title || '',
        body: data?.notification?.body || ''
      });
    })
    .catch((err) => console.log('failed: ', err));





  //UseEffects

  useEffect(() => {
    if (userEmail != "invalid") {
      dispatch(fetchUsers(userEmail));
      requestForToken();
    }
  }, [userEmail]);


  useEffect(() => {
    if (user.user.Id != 0) connectToSocket();
  }, [user.user]);




  const notify = () => toast(<ToastDisplay />);
  function ToastDisplay() {
    return (
      <div>
        <p><b>{notification?.title}</b></p>
        <p>{notification?.body}</p>
      </div>
    );
  };

  useEffect(() => {
    if (notification?.title) {
      notify()

    }
  }, [notification])


  //Functions

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

  const connectToSocket = () => {
    const { socket } = useSocketHook(user.user.Id);

    socket.onopen = function () {
      UpdateUserStatus("online");
    };

    socket.onclose = () => {
      UpdateUserStatus("offline");
    };
  };

  if (!session) {
    <p>LoadIng</p>;
  }
  return(
  <div>
    <Toaster />
    <HomePage />;
  </div>
  )

}
