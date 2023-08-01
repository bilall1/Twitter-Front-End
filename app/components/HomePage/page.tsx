'use client'

import { data } from 'autoprefixer'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import HomeRightBar from '../HomeRightBar'
import HomeMidSection from '../HomeMidSection'

export default function HomePage() {
  return (
    <div className='flex h-screen w-screen font-sans'>


      <SideBar />

      <HomeMidSection />
      
      <HomeRightBar />

    </div>


  )
}
