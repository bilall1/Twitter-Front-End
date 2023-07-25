import React from 'react'
import profile from "../assets/profile.png"
import Image from 'next/image'
import like from "../assets/like.png"
import comment from "../assets/comment.png"
import random1 from "../assets/random1.jpg"

interface ChildProps {
    email :string,
    content: string;
    FirstName:string;
    LastName:string;
  }

const Tweet : React.FC<ChildProps> = ({ email,content,FirstName,LastName }) => {

    return (
        <div className="w-9/12 border-2 border-gray-100 mb-2 bg-white" >
            <div className=" flex py-3">
            
            <div className='flex px-2 ' >
                    <Image className="h-16 w-16 mr-2 rounded-full h" src={random1} alt="" />
                    
                    <div className='flex-col px-1 pt-1'>
                    <h2 className="text-2xl ">{FirstName} {LastName}</h2>
                    <h2 className='text-m text-purple-700 text-opacity-50'>{email}</h2>
                    </div>
            </div>
                
            </div>

            <div className="py-1 px-2">
                <p className='text-xl'>{content}</p>
            </div>

            <div className="flex px-2 pt-8">
            <button className='px-2'>
                <Image className="h-8 w-8 mr-2 " src={like} alt="" />
            </button>
            
            <button className='px-4 py-2'>
                <Image className="h-8 w-8 mr-2" src={comment} alt="" />
            </button>
            </div>
            

        </div>


    )
}

export default Tweet