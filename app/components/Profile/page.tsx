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

import { SetStateAction } from "react";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageResponse } from "next/server";
import dummy from "../../assets/dummy.png"


const Profile = () => {

  //Redux store 
  const user = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()


  const [page, setPage] = useState(1);

  interface Tweet {
    Id: number;
    Content: string;
    Link : string;
    // include other properties of a tweet as necessary
  }


  const [tweets, setTweets] = useState<Tweet[] | null>(null);
  const [reloading, setReloading] = useState(false);

  //Profile Editing
  const [editing, setEditing] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false)
  const [showInput, setShowInput] = useState(false)

  //Profile Upload
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);


  let date;
  let formattedDate;

  if (user.user.D_o_b == '') {
    formattedDate = ''

  } else {
    date = new Date(user.user.D_o_b);
    formattedDate = date.toISOString().slice(0, 10);
  }

  const [formData, setFormData] = useState({
    FirstName: user.user.FirstName,
    LastName: user.user.LastName,
    Email: user.user.Email,
    D_o_b: formattedDate,
    Password: user.user.Password

    // Add any other fields you want the user to be able to edit
  });



  const handleImageChange = (e: any) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setProfileEditing(!profileEditing)
      setShowInput(!showInput)
    }
  };

  const handleProfileSubmit = async () => {

    if (image) {
      const imageRef = ref(storage, "profile/" + user.user.Id);

      uploadBytes(imageRef, image)
        .then(() => {
          getDownloadURL(imageRef)
            .then(async (url) => {
              console.log('url: ', url)
              if (url) {
                setUrl(url);

                const postData = {
                  "Id": user.user.Id,
                  "Link": url
                }

                try {
                  const response = await apiClient.post('/addProfilePicture', postData);
                  console.log('postData: ', postData)
                  dispatch(fetchUsers(userEmail))
                }
                catch (error) {
                  console.error("Cant submit profile in data base")

                }
              }
            })
            .catch((error: { message: any; }) => {
              console.log(error.message, "error getting the image url");
            });
          setImage(null);
        })
        .catch((error: { message: any; }) => {
          console.log(error.message);
        });



    }



    setProfileEditing(!profileEditing)
  };





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
  }, [userEmail, page])



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

  useEffect(() => {
    setReloading(false)

  }, [tweets]);



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
      setReloading(true)

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

            <div className='flex flex-col'>
              {profileEditing ?

                <button className='ml-48' onClick={handleProfileSubmit}>
                  <FiSave></FiSave>
                </button>

                :
                <button className='ml-48' onClick={() => { setShowInput(!showInput) }}>
                  <FiEdit2></FiEdit2>
                </button>

              }
              {user.user.Profile ? <Image className='rounded-full' src={user.user.Profile} alt="Profile" width={180} height={180} /> : <Image src={dummy} alt="User avatar" className="w-24 h-24 rounded-full" />}


            </div>

            {showInput ?
              <div>
                <input type="file" onChange={handleImageChange} />
              </div>
              :
              <p></p>


            }


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
              className='text-xl'

            >
              <FiEdit2></FiEdit2>
            </button>
          }


        </div>

        <div className='border-b-2 border-gray-500 opacity-50 my-4 w-3/4'>

        </div>

        <div className="py-4 px-2 flex flex-col " >

          {!reloading ? <div>
            {tweets && tweets.map((tweet: Tweet, index: React.Key | null | undefined) => (
              <Tweet key={index} email={user.user.Email} content={tweet.Content} FirstName={user.user.FirstName} LastName={user.user.LastName} TweetId={tweet.Id} Profile={user.user.Profile} onDelete={deleteTweet} Link={tweet.Link} />
            ))}

          </div>
            : <div>Loading...</div>}


        </div>

      </div>

      <ProfileRightBar />

    </div>
  )
}

export default Profile