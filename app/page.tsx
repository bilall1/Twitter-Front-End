'use client'

import { data } from 'autoprefixer'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SideBar from './components/SideBar'
import HomeRightBar from './components/HomeRightBar'
import Tweet from './components/Tweet'
import apiClient from './api/api'

export default function Home() {


  const router = useRouter()

  const { data: session } = useSession({
    required: true
  })


  useEffect(() => {

    const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email

  }, [session])

  if (!session) {
    //Return some loading page
  }

  const [content, setContent] = useState('');



  const handleContentChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setContent(value);
  };

  const handleSubmit = async (e: any) => {
    const userEmail = session?.user?.email || 'invalid'

    //Post tweet request to data base 

    const postData={
      "Email": userEmail,
      "Content":content
    }

    const response = await apiClient.post('/postTweet', postData); 
    console.log('Tweet Response:', response.data);

  };

  return (
    <div className='flex h-screen w-screen font-sans'>

      <SideBar />

      <div className='w-full h-full flex flex-col pt-12'>

        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white px-2">Twitter </h1>
        </div>

        <div className="w-9/12 flex flex-col py-2 px-2">

              <div className='flex flex-col justify-between'>

              <textarea className="px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={100} id="content" value={content} onChange={handleContentChange} placeholder='Share your thoughts!'/>

              {/* <input className="py-2" type="file" id="picture" onChange={handlePictureChange} /> */}

              </div>

            <br></br>
            <div className='py-2'>
            <button className="self-start px-2  py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"  type="submit" onClick={handleSubmit}>Post</button>

            </div>
      
        </div>

        <div className="py-10 px-2">
          {/* <Tweet/>
          <Tweet/>
          <Tweet/>
          <Tweet/>
          <Tweet/>
          <Tweet/> */}

        </div>

        {/* <button onClick={() => signOut()}>
          Sign Out
        </button> */}
      </div>

      <HomeRightBar />

    </div>


  )
}
