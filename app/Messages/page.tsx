import React from 'react'
import SideBar from '../components/SideBar'
import MessageMidSection from '../components/MessageMidSection'

const page = () => {
  return (
    <div className="flex h-screen w-screen font-sans">
    <SideBar />
    <MessageMidSection/>
    </div>
   

  )
}

export default page