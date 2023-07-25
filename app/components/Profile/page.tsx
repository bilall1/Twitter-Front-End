"use client"
import React, { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import Tweet from '../Tweet'
import RightBar from '../RightBar'
import apiClient from '@/app/api/api'
import { signOut, useSession } from 'next-auth/react'


const Profile = () => {

  interface Tweet {
    ID: string;
    Content: string;
    // include other properties of a tweet as necessary
  }
  
  interface TweetsData {
    Tweets: Tweet[];
    Email : string ;
    FirstName: string;
    LastName:string;
  }
  
  const [tweets, setTweets] = useState<TweetsData | null>(null);


  const { data: session } = useSession({
    required: true
  })
  const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email

  const retrieveTweets = async () => {
    const postData = {
      "Email": userEmail
    }
    try {
      const response = await apiClient.post('/getTweets', postData);
      console.log(response.data);
      setTweets(response.data);
    } catch (error) {
      console.error('Error while retrieving tweets:', error);
    }
  }

    useEffect(() => {
      retrieveTweets()
    }, [userEmail])

  return (
    <div className='flex h-screen w-screen font-sans'>

      <SideBar />

      <div className='w-full h-full flex flex-col pt-10'>

        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white px-2">Profile </h1>
        </div>

        <div className="py-5 px-2">
        { tweets && tweets.Tweets && tweets.Tweets.map((tweet: { Content: string },index: React.Key | null | undefined) => (
          <Tweet key={index} email={tweets.Email} content={tweet.Content} FirstName={tweets.FirstName} LastName={tweets.LastName}/>
        ))} 
        </div>

      </div>

      <RightBar />

    </div>
  )
}

export default Profile