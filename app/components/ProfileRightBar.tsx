import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import apiClient from "../api/api";
import { useSession } from "next-auth/react";
import dummy from "../assets/dummy.png";
import { useAppSelector } from "../Redux/hooks";

import {MySession, User} from "../Interfaces/interface"

const ProfileRightBar = () => {
  //Redux store
  const user = useAppSelector((state) => state.user);

  //Page Count
  const [followingPage, setFollowingPage] = useState(1);
  const [followerPage, setFollowerPage] = useState(1);

  //Follower/Following
  const [followings, setFollowings] = useState<User[] | null>(null);
  const [followers, setFollowers] = useState<User[] | null>(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [totalFollowings, setTotalFollowings] = useState(0);
  const [reloading, setReloading] = useState(false);

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  //Div References
  const followingRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  //Header
  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };

  //UseEffects

  useEffect(() => {
    retrievefollowing();
  }, [userEmail, followingPage]);

  useEffect(() => {
    retrievefollowers();
  }, [userEmail, followerPage]);

  useEffect(() => {
    getCountofFollowers();
    getCountofFollowings();
  }, [reloading]);

  useEffect(() => {
    const div = followerRef.current;
    if (div) {
      div.addEventListener("scroll", handleScrollForFollower);
    }
    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScrollForFollower);
      }
    };
  }, []);

  useEffect(() => {
    const div = followingRef.current;
    if (div) {
      div.addEventListener("scroll", handleScrollForFollowing);
    }
    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScrollForFollowing);
      }
    };
  }, []);

  //Functions

  const retrievefollowing = async () => {
    try {
      const response = await apiClient.get(`/getFollowing?Id=${user.user.Id}&Page=${followingPage}`,config);
      setFollowings((prevFollowings) => {
        if (prevFollowings) {
          return [...prevFollowings, ...response.data.Following];
        } else {
          return response.data.Following;
        }
      });
    } catch (error) {
      console.error("Error while retrieving user followings");
    }
  };

  const handleScrollForFollowing = (event: Event) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (clientHeight + scrollTop !== scrollHeight) return;
    setFollowingPage((oldPage) => oldPage + 1);
  };

  const retrievefollowers = async () => {
    try {
      const response = await apiClient.get(`/getFollowers?Id=${user.user.Id}&Page=${followerPage}`,config);
      setFollowers((prevFollowers) => {
        if (prevFollowers) {
          return [...prevFollowers, ...response.data.Followers];
        } else {
          return response.data.Followers;
        }
      });
    } catch (error) {
      console.error("Error while retrieving user followers");
    }
  };

  const getCountofFollowers = async () => {
    try {
      const response = await apiClient.get(`/getTotalFollowers?Id=${user.user.Id}`,config);
      setTotalFollowers(response.data.Count);
    } catch (error) {
      console.error("Error while getting followers count");
    }
  };
  const getCountofFollowings = async () => {
    try {
      const response = await apiClient.get(`/getTotalFollowings?Id=${user.user.Id}`,config);
      setTotalFollowings(response.data.Count);
    } catch (error) {
      console.error("Error while getting followers count");
    }
  };

  const handleScrollForFollower = (event: Event) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (clientHeight + scrollTop !== scrollHeight) return;
    setFollowerPage((oldPage) => oldPage + 1);
  };

  const handleUnfollow = async (userId: string) => {
    try {
      const response = await apiClient.delete(`/deleteFollower?UserId=${user.user.Id}&FollowerId=${userId}`,config);

      if (response.status === 200) {
        setFollowings(
          (prevFollowings) =>
            prevFollowings?.filter((user) => user.Id !== userId) || null
        );

        setReloading(!reloading);
      } else {
        console.error("Error while unfollowing user");
      }
    } catch (error) {
      console.error("Error while unfollowing user");
    }
  };

  return (
    <div className="w-1/3 h-full flex flex-col pt-14 ">
      <div className="fixed flex flex-col justify-between">
        <div>
          <div className="border-b-2 border-gray-500 opacity-50 pb-4">
            <span className="text-2xl "> {totalFollowings} Following</span>
          </div>

          <div
            className="pt-2"
            ref={followingRef}
            style={{
              height: "300px",
              overflow: "auto",
              scrollbarWidth: "none",
            }}
          >
            {followings &&
              followings.map(
                (user: User, index: React.Key | null | undefined) => (
                  <div className="pl-3 pt-3 flex-col py-2" key={index}>
                    <div className="flex">
                      {user.Profile ? (
                        <Image
                          className="lg:h-12 lg:w-12 h-6 w-6 rounded-full mr-2"
                          src={user.Profile}
                          alt="Profile"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <Image
                          className="lg:h-12 lg:w-12 h-6 w-6 rounded-full mr-2"
                          src={dummy}
                          alt="User avatar"
                        />
                      )}
                      <span className="hidden md:inline-block lg:text-2xl mt-1">
                        {user.FirstName} {user.LastName}
                      </span>
                    </div>

                    <div>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white py-2 ml-14 px-2 rounded-full"
                        onClick={() => handleUnfollow(user.Id)}
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>

        <div>
          <div className="border-b-2 border-gray-500 opacity-50 pb-4 mt-8">
            <span className="text-2xl ">{totalFollowers} Followers</span>

          </div>

          <div
            className="pt-2"
            ref={followerRef}
            style={{
              height: "300px",
              overflow: "auto",
              scrollbarWidth: "none",
            }}
          >
            {followers &&
              followers.map(
                (user: User, index: React.Key | null | undefined) => (
                  <div className="pl-3 pt-3 flex-col py-2" key={index}>
                    <div className="flex">
                      {user.Profile ? (
                        <Image
                          className="lg:h-12 lg:w-12 h-6 w-6 rounded-full mr-2"
                          src={user.Profile}
                          alt="Profile"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <Image
                          className="lg:h-12 lg:w-12 h-6 w-6 rounded-full mr-2"
                          src={dummy}
                          alt="User avatar"
                        />
                      )}
                      <span className="hidden md:inline-block lg:text-2xl">
                        {user.FirstName} {user.LastName}
                      </span>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRightBar;
