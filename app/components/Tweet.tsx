import React, { useEffect, useState } from 'react'
import profile from "../assets/profile.png"
import Image from 'next/image'
import like from "../assets/like.png"
import comment from "../assets/comment.png"
import dummy from "../assets/dummy.png"
import { useAppSelector } from '../hooks'
import apiClient from '../api/api'
import heartFilled from "../assets/heart-filled.png"

interface ChildProps {
    TweetId: number;
    email: string;
    content: string;
    FirstName: string;
    LastName: string;
}

const Tweet: React.FC<ChildProps> = ({ email, content, FirstName, LastName, TweetId }) => {


    const [likeResponse, setlikeResponse] = useState(0)
    const [likePressed, setlikePressed] = useState(0)
    const [totalLikes, settotalLikes] = useState(0)

    const [showCommentBox, setShowCommentBox] = useState(false);

    //Redux store 
    const user = useAppSelector(state => state.user)

    const ifLiked = async () => {

        const postData = {
            "TweetId": TweetId,
            "UserId": user.user.Id,
        }
        try {
            const response = await apiClient.post('/getIfTweetLiked', postData);
            setlikeResponse(response.data.Like)

        } catch (error) {
            console.error('Error getting if liked');
        }
    }

    const getLikes = async () => {

        const postData = {
            "TweetId": TweetId
        }
        try {
            const response = await apiClient.post('/getLikesOnTweet', postData);
            settotalLikes(response.data.Count)

        } catch (error) {
            console.error('Error getting likes on tweets');
        }
    }

    const handleLike = async () => {

        const postData = {
            "TweetId": TweetId,
            "UserId": user.user.Id,
        }
        try {
            const response = await apiClient.post('/likeTweet', postData);

            if (likePressed == 0) {
                setlikePressed(1)
            } else {
                setlikePressed(0)
            }

        } catch (error) {
            console.error('Error liking the tweet');
        }
    }

    const handleUnLike = async () => {

        const postData = {
            "TweetId": TweetId,
            "UserId": user.user.Id,
        }
        try {
            const response = await apiClient.post('/unlikeTweet', postData);

            if (likePressed == 0) {
                setlikePressed(1)
            } else {
                setlikePressed(0)
            }

        } catch (error) {
            console.error('Error Unliking the tweet');
        }
    }

    const handleComment = () => {
        setShowCommentBox(!showCommentBox);
    }

    useEffect(() => {
        ifLiked()
        getLikes()

    }, [likePressed])

    return (
        <div className="w-9/12 border-2 border-gray-100 mb-2 bg-white" >
            <div className=" flex py-3">

                <div className='flex px-2 ' >
                    <Image className="h-16 w-16 mr-2 rounded-full h" src={dummy} alt="" />

                    <div className='flex-col px-1 pt-1'>
                        <h2 className="text-2xl ">{FirstName} {LastName}</h2>
                        <h2 className='text-m text-purple-700 text-opacity-50'>{email}</h2>
                    </div>
                </div>

            </div>

            <div className="py-1 px-2">
                <p className='text-xl'>{content}</p>
            </div>

            <div className="flex px-2 pt-8 py-2">

                {likeResponse ?
                    <button className='px-2 flex' onClick={handleUnLike}>
                        <Image className="h-8 w-8 mr-2 " src={heartFilled} alt="" />
                        <span className="text-xl">{totalLikes}</span>
                    </button>
                    :
                    <button className='px-2 flex' onClick={handleLike}>
                        <Image className="h-8 w-8 mr-2 " src={like} alt="" />
                        <span className="text-xl">{totalLikes}</span>
                    </button>
                }



                <button className='px-4 flex' onClick={handleComment}>
                    <Image className="h-8 w-8 mr-2" src={comment} alt="" />
                </button>
            </div>

            {showCommentBox &&

                <div className='mt-2 py-2 border-t-2 border-gray-500 '>

                    {/* onSubmit={handleSubmit} */}
                    <form >
                        {/* value={comment} onChange={handleCommentChange} */}
                        <textarea className="w-full px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='Type your comment' />
                        
                        <button className=" mt-1 self-start px-1  py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" type="submit">Comment</button>
                    </form>

                </div>

            }


        </div>


    )
}

export default Tweet