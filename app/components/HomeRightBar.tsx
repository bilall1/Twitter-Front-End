import React, { useEffect, useState } from 'react'
import follow from "../assets/random1.jpg"
import Image from 'next/image'
import apiClient from '../api/api'
import { useSession } from 'next-auth/react'
import dummy from "../assets/dummy.png"
import FollowUser from './FollowUser'

const RightBar = () => {


//   interface User {
//     Id        : string
// 	FirstName  :string
// 	LastName   :string
//     // include other properties of a tweet as necessary
//   }
  
//   interface UserData {
//     people: User[];
//   }
  


//     const [toFollow, setToFollow] =  useState<UserData | null>(null);

//     const { data: session } = useSession({
//         required: true
//     })
//     const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email


//     const retrievePeopleToFollow = async () => {

//         try {

//             const postData = {
//                 "Email": userEmail
//             }

//             const response = await apiClient.post('/getPeopleToFollow', postData);
//             console.log(response.data)
//             setToFollow(response.data)
//         } catch (error) {
//             console.error('Error loading people to follow');
//         }

//     }

//     useEffect(() => {
//         retrievePeopleToFollow()
//     }, [userEmail])

    return (

        <div className='w-1/3 h-full flex flex-col pt-14'>

            <div className='border-b-2 border-gray-500 opacity-50 pb-4'>
                <span className='text-2xl '> People you may know</span>
            </div>

            <div className='pt-8'>

                <FollowUser />

                {/* {toFollow && toFollow.people && toFollow.people.map((people: { FirstName: string , LastName:string },index: React.Key | null | undefined) => (

                    <div className='pl-3 pt-3 flex-col py-2'key={index}>
                        <div className='flex'>
                            <Image className="lg:h-10 lg:w-10 h-6 w-6 rounded-full h mr-2" src={dummy} alt="" />
                            <span className="hidden md:inline-block lg:text-2xl">{people.FirstName} {people.LastName}</span>
                        </div>

                        <div>
                            <button className="self-start px-2 ml-12 py-1 text-white bg-blue-400 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" >Follow</button>
                        </div>

                    </div>

                ))} */}

            </div>


        </div>

    )
}

export default RightBar