import React, { useEffect, useState } from 'react'
import follow from "../assets/random1.jpg"
import Image from 'next/image'
import apiClient from '../api/api'
import { useSession } from 'next-auth/react'
import dummy from "../assets/dummy.png"
import FollowUser from './FollowUser'

const RightBar = () => {

    return (

        <div className='w-1/3 h-full flex flex-col pt-14'>

            <div className='border-b-2 border-gray-500 opacity-50 pb-4'>
                <span className='text-2xl '> People you may know</span>
            </div>

            <div className='pt-8'>
                <FollowUser />
            </div>


        </div>

    )
}

export default RightBar