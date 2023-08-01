"use client"
import React, { useEffect, useRef, useState } from 'react'
import SideBar from '../SideBar'
import DaTweetsData from '../Tweet'
import RightBar from '../RightBar'
import apiClient from '@/app/api/api'
import { signOut, useSession } from 'next-auth/react'
import ProfileRightBar from '../ProfileRightBar'
import Tweet from '../Tweet'

import { useAppSelector } from '../../hooks';


const Profile = () => {

   //Redux store 
   const user = useAppSelector(state => state.user)

  const [page, setPage] = useState(1);

  interface Tweet {
    ID: string;
    Content: string;
    // include other properties of a tweet as necessary
  }

  interface TweetsData {
    Tweets: Tweet[];
    Email: string;
    FirstName: string;
    LastName: string;
  }

  const [tweets, setTweets] = useState<TweetsData>({ Tweets: [], Email: '', FirstName: '', LastName: '' });


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
      setTweets(prevTweets => ({
        ...response.data,
        Tweets: [...prevTweets.Tweets, ...response.data.Tweets]
      }));
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

  return (
    <div className='flex h-screen w-screen font-sans'>

      <SideBar />

      <div className='w-full h-full flex flex-col pt-10 '>

        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white px-2">Profile </h1>

        </div>

        <div className="py-5 px-2">
          {tweets && tweets.Tweets && tweets.Tweets.map((tweet: { Content: string }, index: React.Key | null | undefined) => (
            <Tweet key={index} email={tweets.Email} content={tweet.Content} FirstName={tweets.FirstName} LastName={tweets.LastName} />
          ))}

        </div>

      </div>

      <ProfileRightBar />

    </div>
  )
}

export default Profile