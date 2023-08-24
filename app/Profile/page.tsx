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

  //Functions

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
      const response = await apiClient.post("/updateUserPassword", postData,config);

      if (response.data.update == 0) {
        setPasswordValid("Old Password Does'nt Match. Try Again!!");
      } else {
        setPasswordValid("Password Updated Successfuly!!");
      }
    } catch (error) {
      console.error("Error changing password");
    }
  };

  const handlePasswordFormUpdate = (e: { target: { name: any; value: any } }) => {
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

      const response = await apiClient.post("/updateUserData", postData,config);
      dispatch(fetchUsers(userEmail));
    } catch (error) {
      console.error("Error while retrieving tweets:");
    }
    setEditing(false);
  };

  const retrieveTweets = async () => {
    const postData = {
      Email: userEmail,
      Page: page,
    };
    try {
      const response = await apiClient.post("/getTweets", postData,config);
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
    const postData = {
      TweetId: id,
    };

    try {
      const response = await apiClient.post("/deleteTweet", postData,config);

      setTweets((oldTweets) =>
        oldTweets ? oldTweets.filter((tweet) => tweet.Id !== id) : []
      );
      setReloading(true);
    } catch (error) {
      console.error("Error while retrieving home tweets:");
    }
  };

  return (
    <div className="flex h-screen w-screen font-sans">
      <SideBar />

      <div className="w-full h-full flex flex-col pt-14 ">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white px-2">
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
                  className="rounded-full"
                  src={URL.createObjectURL(image)}
                  alt="ProfileImage"
                  width={180}
                  height={180}
                />
              ) : (
                <div>
                  {user.user.Profile ? (
                    <Image
                      className="rounded-full"
                      src={user.user.Profile}
                      alt="ProfileImage"
                      width={180}
                      height={180}
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
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex-col">
                    <button onClick={handleClosePasswordModal}>
                      <Image src={cross} alt="Cross Icon" className="h-8 w-8 ml-96" />
                    </button>
                  </div>

                  <h3 className="font-bold text-2xl text-gray-600 mb-6 mt-4">
                    Manage Password:
                  </h3>

                  <div className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      Old Password:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      <input
                        type="password"
                        name="OldPassword"
                        onChange={handlePasswordFormUpdate}
                        className="border rounded px-2 py-1"
                      />
                    </h2>
                  </div>

                  <div className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      New Password:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      <input
                        type="password"
                        name="NewPassword"
                        onChange={handlePasswordFormUpdate}
                        className="border rounded px-2 py-1"
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

            <h2 className="font-bold text-2xl text-gray-500">
              {user.user.FirstName} {user.user.LastName}
            </h2>

            <button
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
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
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex-col">
                    <button onClick={handleClosePersonalInfoModal}>
                      <Image src={cross} alt="Cross Icon" className="h-8 w-8 ml-96" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold mb-4">
                    Personal Information
                  </h2>

                  <div className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      First Name:
                    </p>

                    <h2 className="text-xl text-gray-600 ">
                      {editing ? (
                        <input
                          type="text"
                          name="FirstName"
                          value={formData.FirstName}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.user.FirstName
                      )}
                    </h2>
                  </div>

                  <div className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      Last Name:
                    </p>

                    <h2 className="text-xl  text-gray-600">
                      {editing ? (
                        <input
                          type="text"
                          name="LastName"
                          value={formData.LastName}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        user.user.LastName
                      )}
                    </h2>
                  </div>

                  <p className="text-lg text-gray-600 m-2">
                    {user.user.Email}
                  </p>

                  <span className="flex m-2">
                    <p className="text-lg text-gray-600 font-bold">
                      Date of Birth:
                    </p>
                    <p className="text-lg text-gray-600">
                      {editing ? (
                        <input
                          type="date"
                          name="D_o_b"
                          value={formData.D_o_b}
                          onChange={handleInputChange}
                          className="border rounded px-2 py-1"
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

        <div className="py-4 px-2 flex flex-col ">
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
            <div>Loading...</div>
          )}
        </div>
      </div>

      <ProfileRightBar />
    </div>
  );
};

export default Profile;
