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

  //UseEffects

  useEffect(() => {
    if (userEmail != "invalid") {
      dispatch(fetchUsers(userEmail));
    }
  }, [userEmail]);

  useEffect(() => {
    if (user.user.Id != 0) connectToSocket();
  }, [user.user]);

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
      console.log("Status : You CONNECTED\n");
      UpdateUserStatus("online");
    };

    socket.onclose = () => {
      UpdateUserStatus("offline");
      console.log("Disconnected from WebSocket");
    };
  };

  if (!session) {
    <p>LoadIng</p>;
  }
  return <HomePage />;
}
