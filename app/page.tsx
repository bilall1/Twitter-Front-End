"use client";
//React
import { useSession } from "next-auth/react";
import { useEffect } from "react";
//Redux
import { useAppSelector, useAppDispatch } from "./Redux/hooks";
import { fetchUsers } from "./Redux/features/user/userSlice";
//Components
import HomePage from "./components/HomePage";

export default function Home() {
  //Redux
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  useEffect(() => {
    if (userEmail != "invalid") {
      dispatch(fetchUsers(userEmail));
    }
  }, [userEmail]);

  if (!session) {
    <p>Loading</p>;
  }
  return <HomePage />;
}
