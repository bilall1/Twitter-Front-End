'use client'

import { data } from 'autoprefixer'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SideBar from './components/SideBar'
import HomeRightBar from './components/HomeRightBar'
import HomeMidSection from './components/HomeMidSection'
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
    //Loading screen
  }


  return (
    <div className='flex h-screen w-screen font-sans'>


      <SideBar />

      <HomeMidSection />
      
      <HomeRightBar />

    </div>


  )
}
