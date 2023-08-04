"use client"
import React, { useEffect, useRef, useState } from 'react'
import SideBar from '../SideBar'
import DaTweetsData from '../Tweet'
import RightBar from '../RightBar'
import apiClient from '@/app/api/api'
import { signOut, useSession } from 'next-auth/react'
import ProfileRightBar from '../ProfileRightBar'
import Tweet from '../Tweet'
import random1 from "../../assets/random1.jpg"
import { useAppDispatch, useAppSelector } from '../../hooks';
import Image from "next/image"
import { FiEdit2 } from 'react-icons/fi';
import { FiSave } from 'react-icons/fi';
import { fetchUsers } from '@/features/user/userSlice'
import { createKey } from 'next/dist/shared/lib/router/router'


const Profile = () => {

  //Redux store 
  const user = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const [page, setPage] = useState(1);

  interface Tweet {
    Id: number;
    Content: string;
    // include other properties of a tweet as necessary
  }


  const [tweets, setTweets] = useState<Tweet[] | null>(null);
  const [reloading, setReloading] = useState(0);


  let date;
  let formattedDate;

  if (user.user.D_o_b == '') {
    formattedDate = ''

  } else {
    date = new Date(user.user.D_o_b);
    formattedDate = date.toISOString().slice(0, 10);
  }


  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: user.user.FirstName,
    LastName: user.user.LastName,
    Email: user.user.Email,
    D_o_b: formattedDate,
    Password: user.user.Password

    // Add any other fields you want the user to be able to edit
  });

  const handleInputChange = (event: { target: { name: any; value: any } }) => {
    console.log(event.target.name)
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {

      const postData = {
        "Id": user.user.Id,
        "FirstName": formData.FirstName,
        "LastName": formData.LastName,
        "D_o_b": formData.D_o_b,
        "Password": formData.Password
      }

      const response = await apiClient.post('/updateUserData', postData);
      dispatch(fetchUsers(userEmail))

    } catch (error) {
      console.error('Error while retrieving tweets:');
    }
    setEditing(false);
  };



  const { data: session } = useSession({
    required: true
  })
  const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email

  const retrieveTweets = async () => {
    const postData = {
      "Email": userEmail,
      "Page": page
    }
    try {
      const response = await apiClient.post('/getTweets', postData);
      setTweets(oldTweets => (oldTweets ? [...oldTweets, ...response.data.Tweets] : response.data.Tweets));
    } catch (error) {
      console.error('Error while retrieving tweets:');
    }
  }

  useEffect(() => {
    retrieveTweets()
  }, [userEmail, page, reloading])



  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop !== scrollHeight) return;
    setPage(oldPage => oldPage + 1);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const deleteTweet = async (id: number) => {
    const postData = {
      "TweetId": id
    }

    try {
      const response = await apiClient.post('/deleteTweet', postData);

      setTweets(oldTweets => (
        oldTweets
          ? oldTweets.filter(tweet => tweet.Id !== id)
          : []
      ));

      if(reloading == 0){
        setReloading(1)
    }
    else{
        setReloading(0)
    }
  


    } catch (error) {
      console.error('Error while retrieving home tweets:');
    }
  }

  return (
    <div className='flex h-screen w-screen font-sans'>

      <SideBar />

      <div className='w-full h-full flex flex-col pt-14 '>

        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white px-2">Profile </h1>

        </div>

        <div className='flex'>
          <div className="flex flex-col space-y-2 pt-6">
            <Image src={random1} alt="User avatar" className="w-24 h-24 rounded-full" />
            <h2 className="text-2xl font-bold">{editing ? <input type="text" name="FirstName" value={formData.FirstName} onChange={handleInputChange} className="border rounded px-2 py-1" /> : user.user.FirstName}</h2>
            <h2 className="text-2xl font-bold">{editing ? <input type="text" name="LastName" value={formData.LastName} onChange={handleInputChange} className="border rounded px-2 py-1" /> : user.user.LastName}</h2>
            <p className="text-lg text-gray-600"> {user.user.Email} </p>
            <span className='flex'>
              <p className="text-lg text-gray-600 font-bold" >Date of Birth:</p>
              <p className="text-lg text-gray-600">

                {editing ?
                  <input type="date" name="D_o_b" value={formData.D_o_b} onChange={handleInputChange} className="border rounded px-2 py-1" />
                  :
                  formattedDate}
              </p>

            </span>

            <span className='flex'>
              <p className="text-lg text-gray-600 font-bold" >Password:</p>
              <p className="ml-2 text-xl text-gray-600">{editing ? <input type="text" name="Password" value={formData.Password} onChange={handleInputChange} className="border rounded px-2 py-1" /> : "******"}</p>

            </span>

          </div>

          {editing ?
            <button className="text-xl" onClick={handleSubmit}>
              <FiSave></FiSave>
            </button> :
            <button onClick={() => {
              setEditing(true);
            }}
              className='text-2xl'

            >
              <FiEdit2></FiEdit2>
            </button>
          }


        </div>

        <div className='border-b-2 border-gray-500 opacity-50 my-4 w-3/4'>

        </div>

        <div className="py-4 px-2 flex flex-col " >
          {tweets && tweets.map((tweet: Tweet, index: React.Key | null | undefined) => (
            <Tweet key={index} email={user.user.Email} content={tweet.Content} FirstName={user.user.FirstName} LastName={user.user.LastName} TweetId={tweet.Id} onDelete={deleteTweet} />
          ))}


        </div>

      </div>

      <ProfileRightBar />

    </div>
  )
}

export default Profile