"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../Redux/hooks";
import apiClient from "../api/api";
//Session
import {
  MySession,
  User,
  Message,
  Conversation,
  UserStatus,
} from "../Interfaces/interface";
import { useSession } from "next-auth/react";
//Images
import SentMsg from "../assets/sendMsg.png";
import NewMessage from "../assets/newMsg.png";
import Image from "next/image";
import dummy from "../assets/dummy.png";
import cross from "../assets/cross.png";
import Online from "../assets/online.png";
import Offline from "../assets/offline.png";
import chatIcon from "../assets/chat.png";
import Previous from "../assets/Previous.png";
import ImageUpload from "../assets/uploadImage.png";
import back from "../assets/back.png";
import { useSocketHook } from "../hooks/useSocketHook";
import { Socket } from "net";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../Firebase/firebase";
import { genRandonString, resizeFile } from "../Shared/sharedFunctions";

const MessageMidSection = () => {
  //Redux store
  const user = useAppSelector((state) => state.user);
  //Messaging
  const [newMessagePane, setNewMessagePane] = useState(false);
  const [otherUsers, setOtherUsers] = useState<User[] | null>(null);
  const [chatuser, setChatuser] = useState<Conversation | null>(null);
  const [content, setContent] = useState("");
  const [chat, setChat] = useState<Message[] | null>(null);
  const [chatPage, setChatPage] = useState(1);
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null
  );
  const [allUserStatus, SetAllUserStatus] = useState<UserStatus[] | null>(null);
  const [reloadChat, setReloadChat] = useState(false);
  const [messageImage, setMessageImage] = useState<any>(null);

  const [previewImage, setPreviewImage] = useState<any>(null);
  const [messageImageUrl, setMessageImageUrl] = useState<string | null>(null);
  //Image Preview
  const [imagePreview, setImagePreview] = useState(false);

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";
  //Configuration
  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };
  //Socket variable
  const { socket } = useSocketHook(user.user.Id);
  const MessageDivRef = useRef<HTMLDivElement>(null);

  //UseEffects
  useEffect(() => {
    GetConversations();
  }, [reloadChat]);

  useEffect(() => {
    GetMessages();
  }, [chatuser, chatPage]);

  useEffect(() => {
    const div = MessageDivRef.current;
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  }, [chat]); // This effect runs whenever the chat array changes.

  //Functions
  const GetOnlineStatus = async () => {
    try {
      const response = await apiClient.get(
        `/getOnlineStatus?Id=${user.user.Id}`,
        config
      );
      SetAllUserStatus(response.data.status);
    } catch (e) {
      console.log("Error getting online status");
    }
  };

  const GetConversations = async () => {
    try {
      const response = await apiClient.get(
        `/getConversations?Id=${user.user.Id}`,
        config
      );
      setConversations(response.data.conversations);
      GetOnlineStatus();
    } catch (e) {
      console.log("Error getting conversations");
    }
  };

  const GetMessages = async () => {
    try {
      const response = await apiClient.get(
        `/getMessages?SenderId=${user.user.Id}&RecieverId=${chatuser?.UserId}&Page=${chatPage}`,
        config
      );
      if (response.data.messages) {
        setChat((oldChat) =>
          oldChat
            ? [...response.data.messages, ...oldChat]
            : response.data.messages
        );
      }
    } catch (e) {
      console.log("Error getting messages");
    }
  };

  const handlePreviousMessages = async () => {
    setChatPage((oldPage) => oldPage + 1);
  };

  const handleNewMessageButton = async () => {
    setNewMessagePane(true);

    try {
      const response = await apiClient.get(
        `/findOtherUsers?Id=${user.user.Id}`,
        config
      );
      setOtherUsers(response.data.user);
    } catch (error) {
      console.log("Error getting users for messaging");
    }
  };

  const handleClosePasswordModal = async () => {
    setNewMessagePane(false);
  };

  function handleConversationSelect(conversation: any) {
    setChatPage(1);
    setChatuser(conversation);
    if (conversation.Id != chatuser?.Id) {
      setChat(null);
    }
    handleClassAddition();
  }

  function handleUserClick(clickedUser: User) {
    setChat(null);
    setChatuser((prevchatuser) => {
      if (!prevchatuser) {
        return {
          UserId: Number(clickedUser.Id),
          UserEmail: clickedUser.Email,
          UserFirstName: clickedUser.FirstName,
          UserLastName: clickedUser.LastName,
          UserProfile: clickedUser.Profile,
          Id: 0,
          Participant1: 0,
          Participant2: 0,
          LastChat: "",
          LastMessage: "",
        };
      }
      return {
        ...prevchatuser,
        UserId: Number(clickedUser.Id),
        UserEmail: clickedUser.Email,
        UserFirstName: clickedUser.FirstName,
        UserLastName: clickedUser.LastName,
        UserProfile: clickedUser.Profile,
        Id: 0,
        Participant1: 0,
        Participant2: 0,
        LastChat: "",
        LastMessage: "",
      };
    });
    setNewMessagePane(false);
    handleClassAddition();
  }

  const handleContentChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setContent(value);
  };

  socket.onmessage = function (e) {
    var responseObject = JSON.parse(e.data);
    let responseAsArray = [responseObject];
    setChat((oldChat) =>
      oldChat ? [...oldChat, responseObject] : responseAsArray
    );
    setReloadChat(!reloadChat);
  };

  function getCurrentTimestamp() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const milliseconds = String(date.getMilliseconds()).padStart(6, "0"); // extended to microsecond precision (though JavaScript does not natively support microseconds)

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  const sendMessageThroughSocket = () => {
    if (socket) {
      const messageData = {
        SenderId: user.user.Id,
        RecieverId: chatuser?.UserId,
        Content: content,
        CreatedAt: getCurrentTimestamp(),
      };
      socket.send(JSON.stringify(messageData));
    } else {
      console.log("Not connected!");
    }
  };

  const handleSendMessage = async () => {
    if (messageImage) {
      try {
        if (messageImage) {
          const imageRef = ref(storage, "messages/" + genRandonString());

          uploadBytes(imageRef, messageImage)
            .then(() => {
              getDownloadURL(imageRef)
                .then(async (messageImageUrl: any) => {
                  if (messageImageUrl) {
                    setMessageImageUrl(messageImageUrl);

                    const postData = {
                      SenderId: user.user.Id,
                      RecieverId: chatuser?.UserId || 0,
                      MessageType: "image",
                      Status: "sent",
                      Content: messageImageUrl,
                      CreatedAt: getCurrentTimestamp(),
                      Id: 0,
                    };

                    try {
                      sendMessageThroughSocket();
                      const response = await apiClient.post(
                        "/sentMessage",
                        postData,
                        config
                      );
                      setReloadChat(!reloadChat);

                      setChat((oldChat) => [...(oldChat || []), postData]);

                      setContent("");
                    } catch (error) {
                      console.log("Error sending messages");
                    }
                  }
                })
                .catch((error: { message: any }) => {
                  console.log(error.message, "error getting the image url");
                });
              setMessageImage(null);
            })
            .catch((error: { message: any }) => {
              console.log(error.message);
            });
        }
      } catch (error) {
        console.error("Error posting content");
      }
    } else {
      const postData = {
        SenderId: user.user.Id,
        RecieverId: chatuser?.UserId || 0,
        MessageType: "text",
        Status: "sent",
        Content: content,
        CreatedAt: getCurrentTimestamp(),
        Id: 0,
      };

      try {
        sendMessageThroughSocket();
        const response = await apiClient.post("/sentMessage", postData, config);
        setReloadChat(!reloadChat);

        setChat((oldChat) => [...(oldChat || []), postData]);

        setContent("");
      } catch (error) {
        console.log("Error sending messages");
      }
    }
  };
  const handleClassAddition = async () => {
    const targetDiv = document.getElementById("targetDiv");
    targetDiv?.classList.add("hidden");
    targetDiv?.classList.add("lg:block");

    const targetDiv1 = document.getElementById("chatBox");
    if (targetDiv1?.classList.contains("hidden")) {
      targetDiv1?.classList.remove("hidden");
      targetDiv1?.classList.remove("lg:block");
    }
  };

  const handleClassRemoval = async () => {
    const targetDiv = document.getElementById("targetDiv");
    targetDiv?.classList.remove("hidden");

    const targetDiv1 = document.getElementById("chatBox");
    targetDiv1?.classList.add("hidden");
    targetDiv1?.classList.add("lg:block");
  };

  const handleImageChange = async (e: any) => {
    if (e.target.files[0]) {
      const image = await resizeFile(e.target.files[0]);
      setMessageImage(image);
    }
  };

  const removeMessageImage = async () => {
    setMessageImage(null);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImagePreview = async (path: string) => {
    setPreviewImage(path);
    setImagePreview(!imagePreview);
  };
  const removePreviewImage = async () => {
    setPreviewImage(null);
    setImagePreview(!imagePreview);
  };

  return (
    <div className="flex h-screen w-screen font-sans relative ml-5 lg:ml-0">
      <div id="targetDiv" className="w-full">
        <div className="fixed w-full lg:w-1/4">
          <div className="mt-6 md:mt-10 lg:mt-10 flex w-10/12 justify-between">
            <h1 className=" font-semibold text-2xl">Messages</h1>
            <button onClick={handleNewMessageButton}>
              <Image
                src={NewMessage}
                alt="New Message Icon"
                className="h-6 w-6 lg:h-8 lg:w-8"
              />
            </button>
          </div>

          {newMessagePane && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-10/12 md:w-6/12 lg:w-3/12">
                <div className="flex justify-between">
                  <h1 className="text-md lg:text-xl font-semibold">
                    New Message
                  </h1>

                  <button onClick={handleClosePasswordModal}>
                    <Image
                      src={cross}
                      alt="Cross Icon"
                      className="h-5 w-5 lg:h-8 lg:w-8"
                    />
                  </button>
                </div>

                {otherUsers &&
                  otherUsers.map(
                    (user: User, index: React.Key | null | undefined) => (
                      <div
                        className="pt-4"
                        key={user.Email}
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex mt-2">
                          {user.Profile ? (
                            <Image
                              src={user.Profile}
                              alt="User avatar"
                              className="w-8 h-8 rounded-full  mt-2"
                              width={100}
                              height={100}
                            />
                          ) : (
                            <Image
                              src={dummy}
                              alt="User avatar"
                              className="w-8 h-8 rounded-full  mt-2"
                              width={100}
                              height={100}
                            />
                          )}

                          <div>
                            <div className="flex flex-col px-4 pt-2">
                              <h2 className="text-md lg:text-xl font-semibold">
                                {user.FirstName} {user.LastName}
                              </h2>
                              <h2 className="text-xs lg:text-m text-gray-600 text-opacity-60 ">
                                {user.Email}
                              </h2>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          )}

          <div id="conversationSelect" className="mt-5 md:mt-3 lg:mt-3">
            {conversations &&
              conversations.map(
                (
                  conversation: Conversation,
                  index: React.Key | null | undefined
                ) => {
                  const date = new Date(conversation.LastChat);
                  var photo = false;
                  console.log(conversation.LastMessage.length)
                  if (conversation.LastMessage.length > 150) {
                    console.log(conversation.LastMessage.length)
                    photo = true;
                  }

                  const status = allUserStatus?.find(
                    (status) => status.UserId === conversation.UserId
                  );

                  return (
                    <div key={conversation.Id}>
                      <div
                        className="pt-4"
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex lg:mt-2 pb-1  md:pt-2 md:pb-2 lg:pt-2 lg:pb-2 border-b-2">
                          {conversation.UserProfile ? (
                            <Image
                              src={conversation.UserProfile}
                              alt="User avatar"
                              className="w-8 h-8 rounded-full  mt-2"
                              width={100}
                              height={100}
                            />
                          ) : (
                            <Image
                              src={dummy}
                              alt="User avatar"
                              className="w-8 h-8 rounded-full  mt-2"
                              width={100}
                              height={100}
                            />
                          )}

                          <div className="w-4/5 ">
                            <div className="flex flex-col px-4 md:pt-2 lg:pt-2">
                              <div className="flex justify-between ">
                                <h2 className="sm:text-md md:text-lg lg:text-xl font-semibold">
                                  {conversation.UserFirstName}{" "}
                                  {conversation.UserLastName}
                                </h2>

                                <div className="flex">
                                  {status?.Status == "online" ? (
                                    <Image
                                      src={Online}
                                      className="h-3 w-3 rounded-full  mt-2"
                                      width={100}
                                      height={100}
                                      alt="Online Icon"
                                    />
                                  ) : (
                                    <Image
                                      src={Offline}
                                      className="h-3 w-3 rounded-full  mt-2"
                                      width={100}
                                      height={100}
                                      alt="Online Icon"
                                    />
                                  )}

                                  <span className="pl-4 text-md  text-gray-600">
                                    {date.getHours()}:{date.getMinutes()}
                                  </span>
                                </div>
                              </div>

                              <h2 className="text-xs text-gray-600 text-opacity-60 ">
                                {conversation.UserEmail}
                              </h2>

                              <span className="text-lg lg:text-xl mt-2 text-gray-600 font-mono ">
                                {photo ? (
                                  <p>Image</p>
                                ) : (
                                  conversation.LastMessage
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>

      <div
        id="chatBox"
        className="w-11/12 lg:w-11/12 mt-10 md:mt-14 lg:mt-20 lg:m-5 lg:border-l-2"
      >
        {chatuser ? (
          <div className="flex flex-col relative h-full">
            <div className="block lg:hidden">
              <button onClick={handleClassRemoval}>
                <Image
                  src={back}
                  alt="Back Icon"
                  className="h-8 w-8 ml-4 md:ml-10"
                />
              </button>
            </div>

            <div className="flex justify-center ">
              <div className="flex flex-col justify-center items-center">
                {chatuser.UserProfile ? (
                  <Image
                    src={chatuser.UserProfile}
                    alt="User avatar"
                    className="h-16 w-16 lg:w-24 lg:h-24 rounded-full ml-5"
                    width={100}
                    height={100}
                  />
                ) : (
                  <Image
                    src={dummy}
                    alt="User avatar"
                    className="h-16 w-16 lg:w-24 lg:h-24 rounded-full ml-5"
                    width={100}
                    height={100}
                  />
                )}

                <h2 className="text-lg md:text-xl lg:text-xl font-semibold mt-2">
                  {chatuser.UserFirstName} {chatuser.UserLastName}
                </h2>
                <h2 className="text-sm md:text-m lg:text-m  text-gray-600 text-opacity-60 ">
                  {chatuser.UserEmail}
                </h2>

                <button>
                  <Image
                    className="mt-2 md:mt-6 lg:mt-8 h-6 w-6"
                    src={Previous}
                    alt="Previous Message Icon"
                    onClick={handlePreviousMessages}
                  />
                </button>
              </div>
            </div>

            <div
              ref={MessageDivRef}
              className="flex flex-col mx-3 md:mx-10 lg:mx-10 pb-24 md:pb-16 lg:pb-16 overflow-y-scroll no-scrollbar"
            >
              {chat &&
                chat.map(
                  (message: Message, index: React.Key | null | undefined) => {
                    const date = new Date(message.CreatedAt);
                    if (message.SenderId != user.user.Id) {
                      return (
                        <>
                          {message.MessageType == "image" ? (
                            <div
                              className="flex w-1/2 "
                              onClick={() =>
                                handleImagePreview(message.Content)
                              }
                            >
                              <img
                                src={message.Content}
                                alt="messageImage"
                                className="rounded-xl"
                              />
                            </div>
                          ) : (
                            <div className="text-sm lg:text-md bg-gray-400 rounded-xl md:rounded-2xl lg:rounded-2xl p-2 md:p-4 lg:p-4 self-start mt-2">
                              {message.Content}
                            </div>
                          )}

                          <span className="self-start lg:ml-3 md:ml-3 text-xs md:text-sm lg:text-sm">
                            {date.getHours()}:{date.getMinutes()}
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          {message.MessageType == "image" ? (
                            <div
                              className="flex justify-end w-1/2 self-end "
                              onClick={() =>
                                handleImagePreview(message.Content)
                              }
                            >
                              <img
                                src={message.Content}
                                alt="messageImage"
                                className="rounded-xl"
                              />
                            </div>
                          ) : (
                            <div className="text-sm lg:text-md bg-blue-400 rounded-xl md:rounded-2xl lg:rounded-2xl p-2 md:p-4 lg:p-4  self-end mt-2 flex flex-col">
                              {message.Content}
                            </div>
                          )}

                          <span className="self-end lg:mr-3 md:mr-3 text-xs md:text-sm lg:text-sm">
                            {date.getHours()}:{date.getMinutes()}
                          </span>
                        </>
                      );
                    }
                  }
                )}
            </div>

            {messageImage? 
              <div className="flex mb-20 ml-10 ">
                <img
                  src={URL.createObjectURL(messageImage)}
                  className="rounded-lg h-52 w-52"
                />

                <Image
                  src={cross}
                  alt="Delete"
                  className="h-8 w-8 "
                  onClick={removeMessageImage}
                />
              </div>
              :
              <></>
            }

            {imagePreview && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
                <div className="p-6 rounded-lg shadow-lg flex">
                  <img src={previewImage} alt="Image Preview" />
                  <Image
                    src={cross}
                    alt="Delete"
                    className="h-6 w-6 "
                    onClick={removePreviewImage}
                  />
                </div>
              </div>
            )}

            <div className="mt-2 flex absolute bottom-12 md:bottom-1 lg:bottom-0 w-11/12  start-8 md:start-28 lg:start-28 bg-white">
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <Image
                  src={ImageUpload}
                  alt="Upload Icon"
                  className="cursor-pointer "
                  onClick={handleIconClick}
                />
              </div>

              {messageImage ? (
                <textarea
                  className="border w-full border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 md:p-2 lg:p-2 text-sm md:text-m lg:text-m"
                  maxLength={150}
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start a new message"
                  readOnly
                ></textarea>
              ) : (
                <textarea
                  className="border w-full border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 md:p-2 lg:p-2 text-sm md:text-m lg:text-m"
                  maxLength={200}
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start a new message"
                ></textarea>
              )}

              <Image
                src={SentMsg}
                alt="User avatar"
                className="w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 rounded-full ml-5"
                onClick={handleSendMessage}
              />
            </div>
          </div>
        ) : (
          <div className=" justify-center items-center h-full hidden lg:flex">
            <div className="flex flex-col items-center">
              <Image src={chatIcon} alt="User avatar" className="w-24 h-24" />

              <h1 className=" font-mono text-xl ">Select a conversation</h1>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageMidSection;
