'use client'

import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'


import { useAppSelector, useAppDispatch } from "./hooks"
import { fetchUsers } from "../features/user/userSlice"
import HomePage from "./components/HomePage/page"



export default function Home() {

  const { data: session } = useSession({
    required: true
  })

  const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email


  useEffect(() => {
    if(userEmail!="invalid"){
      dispatch(fetchUsers(userEmail))
      console.log("Dispatcher Called") 
    }

  }, [userEmail])

  if (!session) {
    //Loading screen
  }
  const user = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  return (
    <HomePage />
  )
}
