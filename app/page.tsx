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


import { useAppSelector, useAppDispatch } from "./hooks"
import { fetchUsers } from "../features/user/userSlice"

export default function Home() {

  const router = useRouter()

  const { data: session } = useSession({
    required: true
  })

  const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email

  useEffect(() => {
    if(userEmail!="invalid"){
      console.log("Dispatched called")
      dispatch(fetchUsers(userEmail))
    }

  }, [userEmail])

  if (!session) {
    //Loading screen
  }
  const user = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  
  // useEffect(() => {
  //   dispatch(fetchUsers("userEmail"))
  // }, [userEmail])



  return (
    <div className='flex h-screen w-screen font-sans'>


      <SideBar />

      <HomeMidSection />
      
      <HomeRightBar />

    </div>


  )
}
