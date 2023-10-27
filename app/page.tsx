"use client";
//React
import { useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
//Redux
import { useAppSelector, useAppDispatch } from "./Redux/hooks";
import { fetchUsers } from "./Redux/features/user/userSlice";
//Components
import HomePage from "./components/HomePage";
import { useSocketHook } from "./hooks/useSocketHook";
import apiClient from "./api/api";
import { FirebaseNotification, MySession } from "./Interfaces/interface";
import { requestForToken } from "./Firebase/token";
import { getMessaging, onMessage } from "firebase/messaging";
import { onMessageListener } from "./Firebase/firebase";
import toast, { Toaster } from "react-hot-toast";

import userContext from "./context/userContext";
import Email from "next-auth/providers/email";
import MyContext from "./context/userContext";

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

export default function Home() {
  //Context
  const context = useContext(MyContext);
  const { userState, setUserState } = context as MyContextType;

  //Redux
  //const user = useAppSelector((state) => state.user);
  //const dispatch = useAppDispatch();

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: userState?.ThirdParty,
    },
  };

  const [notification, setNotification] = useState({ title: "", body: "" });

  onMessageListener()
    .then((payload) => {
      const data: FirebaseNotification = payload as FirebaseNotification;
      setNotification({
        title: data?.notification?.title || "",
        body: data?.notification?.body || "",
      });
    })
    .catch((err) => console.log("failed: ", err));

  const UpdateNotificationToken = async (token: any) => {
    const postData = {
      UserId: userState?.Id,
      Token: token,
    };
    try {
      const response = await apiClient.put(
        "/updateNotificationToken",
        postData,
        config
      );
    } catch (error) {
      console.log("Error setting notification token");
    }
  };

  const notify = () => toast(<ToastDisplay />);
  function ToastDisplay() {
    return (
      <div>
        <p>
          <b>{notification?.title}</b>
        </p>
        <p>{notification?.body}</p>
      </div>
    );
  }

  //UseEffects

  useEffect(() => {
    console.log("called")
    if (userEmail != "invalid") {
      //dispatch(fetchUsers(userEmail));


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

  useEffect(() => {
    if (userState?.Id != 0) {
      connectToSocket();
      requestForToken().then((token) => {
        UpdateNotificationToken(token);
      });
    }
  }, [userState]);

  useEffect(() => {
    if (notification?.title) {
      notify();
    }
  }, [notification]);

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
      UserId: userState?.Id,
      Status: status,
    };

    try {
      const response = await apiClient.put("/updateStatus", postData, config);
    } catch (error) {
      console.log("Error setting user status");
    }
  };

  const connectToSocket = () => {
    const { socket } = useSocketHook(userState?.Id);

    socket.onopen = function () {
      UpdateUserStatus("online");
    };

    socket.onclose = () => {
      UpdateUserStatus("offline");
    };
  };

  if (!session) {
    <p>Session Expired Login Again</p>;
  } else {
    return (
      <div>
        <Toaster />
      <HomePage />;
      </div>
    );
  }
}
