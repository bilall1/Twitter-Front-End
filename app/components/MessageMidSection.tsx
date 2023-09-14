"use client";
import React, { useEffect, useState } from "react";
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
import Offline from "../assets/offline.png"
import chatIcon from "../assets/chat.png";
import { useSocketHook } from "../hooks/useSocketHook";
import { Socket } from "net";

const MessageMidSection = () => {
  //Redux store
  const user = useAppSelector((state) => state.user);
  //Messaging
  const [newMessagePane, setNewMessagePane] = useState(false);
  const [otherUsers, setOtherUsers] = useState<User[] | null>(null);
  const [chatuser, setChatuser] = useState<Conversation | null>(null);
  const [content, setContent] = useState("");
  const [chat, setChat] = useState<Message[] | null>(null);
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null
  );
  const [allUserStatus, SetAllUserStatus] = useState<UserStatus[] | null>(null);
  const [reloadChat, setReloadChat] = useState(false);
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

  //UseEffects
  useEffect(() => {
    GetConversations();
  }, [reloadChat]);

  useEffect(() => {
    GetMessages();
  }, [chatuser, reloadChat]);

  //Functions
  const GetOnlineStatus = async () => {
    try {
      const response = await apiClient.get(
        `/getOnlineStatus?Id=${user.user.Id}`,
        config
      );
      SetAllUserStatus(response.data.status);
      console.log(response.data.status);
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
        `/getMessages?SenderId=${user.user.Id}&RecieverId=${chatuser?.UserId}`,
        config
      );
      setChat(response.data.messages);
    } catch (e) {
      console.log("Error getting messages");
    }
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
    setChatuser(conversation);
  }

  function handleUserClick(clickedUser: User) {
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
  }

  const handleContentChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setContent(value);
  };

  socket.onmessage = function (e) {
    console.log("Message : " + e.data + "\n");
    var responseObject = JSON.parse(e.data);

    setChat((oldChat) =>
      oldChat ? [...oldChat, responseObject] : responseObject
    );
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
      //setReloadChat(!reloadChat);

      setChat((oldChat) => [...(oldChat || []), postData]);

      setContent("");
    } catch (error) {
      console.log("Error sending messages");
    }
  };

  return (
    <div className="flex h-screen w-screen font-sans">
      <div className="w-2/5">
        <div className="mt-10 flex justify-between">
          <h1 className="font-semibold text-2xl">Messages</h1>

          <button onClick={handleNewMessageButton}>
            <Image
              src={NewMessage}
              alt="New Message Icon"
              className="h-8 w-8"
            />
          </button>
        </div>

        {newMessagePane && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-2/7">
              <div className="flex">
                <h1 className=" text-xl font-semibold">New Message</h1>

                <button onClick={handleClosePasswordModal}>
                  <Image
                    src={cross}
                    alt="Cross Icon"
                    className="h-8 w-8 ml-96"
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
                            <h2 className=" text-xl font-semibold">
                              {user.FirstName} {user.LastName}
                            </h2>
                            <h2 className="text-m text-gray-600 text-opacity-60 ">
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

        <div className="mt-3">
          {conversations &&
            conversations.map(
              (
                conversation: Conversation,
                index: React.Key | null | undefined
              ) => {
                const date = new Date(conversation.LastChat);

                const status = allUserStatus?.find(
                  (status) => status.UserId === conversation.UserId
                );

                return (
                  <div key={conversation.Id}>
                    <div
                      className="pt-4"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex mt-2 pt-2 pb-2 border-b-2">
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
                          <div className="flex flex-col px-4 pt-2">
                            <div className="flex justify-between ">
                              <h2 className=" text-xl font-semibold">
                                {conversation.UserFirstName}{" "}
                                {conversation.UserLastName}
                              </h2>

                              {status?.Status=="online" ?
                              <Image src={Online} 
                                 className="w-4 h-4 rounded-full  mt-2" 
                                   width={100}
                                   height={100}
                                alt="Online Icon" />

                                :
                                <Image src={Offline} 
                                 className="w-4 h-4 rounded-full  mt-2" 
                                   width={100}
                                   height={100}
                                alt="Online Icon" />
                              }

                                
                              <span className="pl-4 text-m text-gray-600">
                                {date.getHours()}:{date.getMinutes()}
                              </span>
                             
                            </div>

                            <h2 className=" text-xs text-gray-600 text-opacity-60 ">
                              {conversation.UserEmail}
                            </h2>

                            <span className="text-xl mt-2 text-gray-600 font-mono ">
                              {conversation.LastMessage}
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

      <div className="w-3/5 mt-20 flex flex-col justify-between m-10 border-l-2">
        {chatuser ? (
          <>
            <div>
              <div className="flex justify-center">
                <div className="flex flex-col justify-center items-center ">
                  {chatuser.UserProfile ? (
                    <Image
                      src={chatuser.UserProfile}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full ml-5"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Image
                      src={dummy}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full ml-5"
                      width={100}
                      height={100}
                    />
                  )}

                  <h2 className="text-xl font-semibold mt-2">
                    {chatuser.UserFirstName} {chatuser.UserLastName}
                  </h2>
                  <h2 className="text-m text-gray-600 text-opacity-60 ">
                    {chatuser.UserEmail}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col justify-between ml-20 m-10">
                {chat &&
                  chat.map(
                    (message: Message, index: React.Key | null | undefined) => {
                      const date = new Date(message.CreatedAt);
                      if (message.SenderId != user.user.Id) {
                        return (
                          <>
                            <div className=" bg-gray-400 rounded-2xl p-4 self-start mt-4">
                              {message.Content}
                            </div>

                            <span className="self-start ml-3 text-sm">
                              {date.getHours()}:{date.getMinutes()}
                            </span>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <div className=" bg-blue-400 rounded-2xl p-4 self-end mt-4 flex flex-col">
                              {message.Content}
                            </div>

                            <span className="self-end mr-3 text-sm">
                              {date.getHours()}:{date.getMinutes()}
                            </span>
                          </>
                        );
                      }
                    }
                  )}
              </div>
            </div>

            <div className="mt-1 flex">
              <textarea
                className="ml-20 border w-2/3 border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 text-m"
                maxLength={200}
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Start a new message"
              />

              <Image
                src={SentMsg}
                alt="User avatar"
                className="w-10 h-10 rounded-full ml-5"
                onClick={handleSendMessage}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
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
