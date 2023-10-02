"use client";
//React
import React, { useEffect, useRef, useState } from "react";
import apiClient from "@/app/api/api";
import { useSession } from "next-auth/react";
//Redux
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import { fetchUsers } from "../Redux/features/user/userSlice";
//FireBase
import { storage } from "../Firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
//Componenents
import SideBar from "../components/SideBar";
import ProfileRightBar from "../components/ProfileRightBar";
import Tweet from "../components/Tweet";
//Pictures
import Image from "next/image";
import { FiEdit2 } from "react-icons/fi";
import { FiSave } from "react-icons/fi";
import dummy from "../assets/dummy.png";
import cross from "../assets/cross.png";
import back from "../assets/back.png";
//Interfaces
import { MySession, TweetInterface } from "../Interfaces/interface";
//Avatar
import AvatarEditor from "react-avatar-editor";

const Profile = () => {
  //Redux store
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  //Sesssion
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  //Header
  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };

  //Right Bar
  const [showRightBar, setShowRightBar] = useState(true);

  //Tweet
  const [page, setPage] = useState(1);
  const [tweets, setTweets] = useState<TweetInterface[] | null>(null);
  const [reloading, setReloading] = useState(false);

  //Profile Editing
  const [editing, setEditing] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [showInput, setShowInput] = useState(false);

  //Profile Upload
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState<string | null>(null);
  const editorRef = useRef<AvatarEditor | null>(null);

  //Crop handler
  const [isCropped, setIsCropped] = useState(false);

  //Date Variables
  let date;
  let formattedDate;

  //Form Data
  if (user.user.D_o_b == "") {
    formattedDate = "";
  } else {
    date = new Date(user.user.D_o_b);
    formattedDate = date.toISOString().slice(0, 10);
  }
  const [formData, setFormData] = useState({
    FirstName: user.user.FirstName,
    LastName: user.user.LastName,
    Email: user.user.Email,
    D_o_b: formattedDate,
  });

  //Password Change
  const [PasswordValid, setPasswordValid] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    OldPassword: "",
    NewPassword: "",
  });

  //UseEffects
  useEffect(() => {
    retrieveTweets();
  }, [userEmail, page]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setReloading(false);
  }, [tweets]);

  
  useEffect(() => {
    // Add the event listener when the component mounts
    window.addEventListener("beforeunload", handleUnload);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  

  useEffect(() => {
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  //Functions

  const handleUnload = async () => {
    await UpdateUserStatus("offline");
  };

  const checkScreenSize = () => {
    const width = window.innerWidth;
    if (width >= 0 && width <= 1023) {
      setShowRightBar(false);
      const targetDiv = document.getElementById("MiddleSection");
      if (targetDiv?.classList.contains("hidden")) {
        targetDiv?.classList.remove("hidden");
      }
    } else {
      setShowRightBar(true);
    }
  };

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

  const handleClosePersonalInfoModal = () => {
    setEditing(false);
  };

  const handleClosePasswordModal = () => {
    setIsUpdatingPassword(false);
    setPasswordValid("");
  };

  const handlePasswordChange = async () => {
    setPasswordValid("");
    try {
      const postData = {
        Id: user.user.Id,
        OldPassword: passwordForm.OldPassword,
        NewPassword: passwordForm.NewPassword,
      };
      const response = await apiClient.put(
        "/updateUserPassword",
        postData,
        config
      );

      if (response.data.update == 0) {
        setPasswordValid("Old Password Does'nt Match. Try Again!!");
      } else {
        setPasswordValid("Password Updated Successfuly!!");
      }
    } catch (error) {
      console.error("Error changing password");
    }
  };

  const handlePasswordFormUpdate = (e: {
    target: { name: any; value: any };
  }) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleCrop = () => {
    setIsCropped(false);
    if (editorRef.current) {
      const canvas = editorRef.current.getImage();
      canvas.toBlob((blob: any) => {
        setImage(blob);
      });
    }
  };

  const handleImageChange = (e: any) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setProfileEditing(!profileEditing);
      setIsCropped(true);
    }
  };

  const handleProfileSubmit = async () => {
    if (image) {
      const imageRef = ref(storage, "profile/" + user.user.Id);

      uploadBytes(imageRef, image)
        .then(() => {
          getDownloadURL(imageRef)
            .then(async (url) => {
              if (url) {
                setUrl(url);

                const postData = {
                  Id: user.user.Id,
                  Link: url,
                };

                try {
                  const response = await apiClient.post(
                    "/addProfilePicture",
                    postData,
                    config
                  );
                  dispatch(fetchUsers(userEmail));
                } catch (error) {
                  console.error("Cant submit profile in data base");
                }
              }
            })
            .catch((error: { message: any }) => {
              console.log(error.message, "error getting the image url");
            });
          setShowInput(!showInput);
        })
        .catch((error: { message: any }) => {
          console.log(error.message);
        });
    }

    setProfileEditing(!profileEditing);
  };

  const handleInputChange = (event: { target: { name: any; value: any } }) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      const postData = {
        Id: user.user.Id,
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        D_o_b: formData.D_o_b,
      };

      const response = await apiClient.put("/updateUserData", postData, config);
      dispatch(fetchUsers(userEmail));
    } catch (error) {
      console.error("Error while retrieving tweets:");
    }
    setEditing(false);
  };

  const retrieveTweets = async () => {
    try {
      const response = await apiClient.get(
        `/getTweets?Email=${userEmail}&Page=${page}`,
        config
      );

      setTweets((oldTweets) =>
        oldTweets
          ? [...oldTweets, ...response.data.Tweets]
          : response.data.Tweets
      );
    } catch (error) {
      console.error("Error while retrieving tweets:");
    }
  };

  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop !== scrollHeight) return;
    setPage((oldPage) => oldPage + 1);
  };

  const deleteTweet = async (id: number) => {
    try {
      const response = await apiClient.delete(`/deleteTweet?Id=${id}`, config);

      setTweets((oldTweets) =>
        oldTweets ? oldTweets.filter((tweet) => tweet.Id !== id) : []
      );
      setReloading(true);
    } catch (error) {
      console.error("Error while retrieving home tweets:");
    }
  };

  const handleClassAddition = async () => {
    setShowRightBar(!showRightBar);
    const targetDiv = document.getElementById("MiddleSection");
    targetDiv?.classList.add("hidden");
    targetDiv?.classList.add("lg:block");
  };

  const handleRightBarHide = async () => {
    setShowRightBar(!showRightBar);
    const targetDiv = document.getElementById("MiddleSection");
    targetDiv?.classList.remove("hidden");
    targetDiv?.classList.remove("lg:block");
  };

  return (
    <div className="flex h-screen w-screen font-sans max-w-[2000px] 2xl:mx-auto">
      <SideBar />
      {showRightBar && (
        <div className="block lg:hidden mt-10 ml-1 md:ml-20">
          <button onClick={handleRightBarHide} className="p-4">
            <Image src={back} alt="Back Icon" className="h-8 w-8 mb-2" />
          </button>
        </div>
      )}
      <div
        id="MiddleSection"
        className="w-full lg:w-10/12 h-full flex flex-col pt-10 lg:pt-14 ml-8 lg:ml-4 "
      >
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white px-2">
            Profile
          </h1>
        </div>

        <div className="flex">
          <div className="flex flex-col space-y-2 pt-6">
            <div className="flex flex-col">
              {profileEditing ? (
                <button className="ml-48" onClick={handleProfileSubmit}>
                  <FiSave></FiSave>
                </button>
              ) : (
                <button
                  className="ml-48"
                  onClick={() => {
                    setShowInput(!showInput);
                  }}
                >
                  <FiEdit2></FiEdit2>
                </button>
              )}

              {image && !isCropped ? (
                <Image
                  className="rounded-full w-32 h-32"
                  src={URL.createObjectURL(image)}
                  alt="ProfileImage"
                  width={1000}
                  height={1000}
                />
              ) : (
                <div>
                  {user.user.Profile ? (
                    <Image
                      className="rounded-full w-32 h-32 lg:w-48 lg:h-48"
                      src={user.user.Profile}
                      alt="ProfileImage"
                      width={1000}
                      height={1000}
                    />
                  ) : (
                    <Image
                      src={dummy}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full"
                    />
                  )}
                </div>
              )}
            </div>

            {showInput ? (
              <div>
                <input type="file" onChange={handleImageChange} />

                {isCropped && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      {image && (
                        <div>
                          <AvatarEditor
                            ref={editorRef}
                            image={image}
                            width={250}
                            height={250}
                            border={50}
                            color={[255, 255, 255, 0.6]}
                            scale={1.2}
                            rotate={0}
                          />
                        </div>
                      )}
                      <button
                        onClick={handleCrop}
                        className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md"
                      >
                        Crop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p></p>
            )}

            {isUpdatingPassword && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-4/12">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-md lg:text-xl text-gray-600 mb-6 ">
                      Manage Password:
                    </h3>
                    <div className="flex-col">
                      <button onClick={handleClosePasswordModal}>
                        <Image
                          src={cross}
                          alt="Cross Icon"
                          className="h-6 w-6 lg:h-7 lg:w-7 "
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex m-2">
                    <p className="text-sm md:text-md lg:text-lg text-gray-600 font-bold">
                      Old Password:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      <input
                        type="password"
                        name="OldPassword"
                        onChange={handlePasswordFormUpdate}
                        className="border rounded px-2 py-1 text-xs md:text-sm font-semibold lg:text-md"
                      />
                    </h2>
                  </div>

                  <div className="flex m-2">
                    <p className="text-sm md:text-md lg:text-lg text-gray-600 font-bold">
                      New Password:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      <input
                        type="password"
                        name="NewPassword"
                        onChange={handlePasswordFormUpdate}
                        className="border rounded px-2 py-1 text-xs md:text-sm font-semibold lg:text-md"
                      />
                    </h2>
                  </div>

                  <p className=" text-blue-500 m-2 font-bold">
                    {PasswordValid}
                  </p>

                  <button
                    onClick={handlePasswordChange}
                    className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            <h2 className="font-bold text-xl lg:text-2xl text-gray-500">
              {user.user.FirstName} {user.user.LastName}
            </h2>

            <div className="flex lg:hidden">
              <button
                className="items-center py-1 underline text-md text-blue-900"
                onClick={handleClassAddition}
              >
                Follower/Following
              </button>
            </div>

            <button
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 md:py-2 lg:py-2 px-2 md:px-4 lg:px-4 rounded"
              onClick={() => {
                setEditing(true);
              }}
            >
              Edit Personal Info
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 5a.5.5 0 01.707-.707L14.293 9l-4.586 4.707a.5.5 0 11-.707-.707L13.293 9 9 5z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>

            {!user.user.ThirdParty && (
              <button
                className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded "
                onClick={() => {
                  setIsUpdatingPassword(true);
                }}
              >
                Update Password
                <svg
                  className="w-5 h-5 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 8V6a6 6 0 0112 0v2h1a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h1zm5 6.732a2 2 0 111 0V16a1 1 0 01-2 0v-1.268zM7 8h6V6a3 3 0 00-6 0v2z"></path>
                </svg>
              </button>
            )}

            {editing && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-4/12">
                  <div className="flex justify-between mb-6 ">
                    <h2 className="text-md lg:text-xl font-bold ">
                      Personal Information
                    </h2>

                    <button onClick={handleClosePersonalInfoModal}>
                      <Image
                        src={cross}
                        alt="Cross Icon"
                        className="w-5 h-5 lg:h-7 lg:w-7 "
                      />
                    </button>
                  </div>

                  <div className="flex m-2">
                    <p className="text-md lg:text-lg text-gray-600 font-bold">
                      First Name:
                    </p>

                    <h2 className="text-xl text-gray-600 ">
                      {editing ? (
                        <input
                          type="text"
                          name="FirstName"
                          value={formData.FirstName}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 text-sm font-semibold lg:text-lg "
                        />
                      ) : (
                        user.user.FirstName
                      )}
                    </h2>
                  </div>

                  <div className="flex m-2">
                    <p className="text-md lg:text-lg text-gray-600 font-bold">
                      Last Name:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      {editing ? (
                        <input
                          type="text"
                          name="LastName"
                          value={formData.LastName}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 text-sm font-semibold lg:text-lg"
                        />
                      ) : (
                        user.user.LastName
                      )}
                    </h2>
                  </div>

                  <p className="lg:text-lg text-gray-600 m-2">
                    {user.user.Email}
                  </p>

                  <span className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      Date of Birth:
                    </p>
                    <p className="text-md lg:text-lg text-gray-600">
                      {editing ? (
                        <input
                          type="date"
                          name="D_o_b"
                          value={formData.D_o_b}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1 text-sm font-semibold lg:text-lg"
                        />
                      ) : (
                        formattedDate
                      )}
                    </p>
                  </span>

                  <button
                    className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md"
                    onClick={handleSubmit}
                  >
                    <FiSave></FiSave>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-b-2 border-gray-500 opacity-50 my-4 w-3/4"></div>

        <div className="py-4 lg:px-2 flex flex-col w-11/12">
          {!reloading ? (
            <div>
              {tweets &&
                tweets.map(
                  (
                    tweet: TweetInterface,
                    index: React.Key | null | undefined
                  ) => (
                    <Tweet
                      key={index}
                      email={user.user.Email}
                      content={tweet.Content}
                      FirstName={user.user.FirstName}
                      LastName={user.user.LastName}
                      TweetId={tweet.Id}
                      Profile={user.user.Profile}
                      onDelete={deleteTweet}
                      Link={tweet.Link}
                    />
                  )
                )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {showRightBar && <ProfileRightBar />}
    </div>
  );
};

export default Profile;
