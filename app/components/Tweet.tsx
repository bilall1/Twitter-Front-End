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
    onDelete: (id: number) => void
}

const Tweet: React.FC<ChildProps> = ({ email, content, FirstName, LastName, TweetId, onDelete }) => {

    //Redux store 
    const user = useAppSelector(state => state.user)

    interface TweetComments {
        Id: number
        TweetId: number
        UserId: number
        TweetComment: string
        Email: string
        FirstName: string
        LastName: string
    }

    //Comments
    const [commentOnTweets, setCommentOnTweets] = useState<TweetComments[] | null>(null);
    const [reloadTweets, setReloadTweets] = useState(0)
    const [contentOfTweet, setContentOfTweet] = useState(content);


    const [totalComments, settotalComments] = useState(0)
    const [reloadComment, setReloadComments] = useState(0)
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentBoxValue, setCommentBoxValue] = useState('');


    //Likes
    const [likeResponse, setlikeResponse] = useState(0)
    const [likePressed, setlikePressed] = useState(0)
    const [totalLikes, settotalLikes] = useState(0)

    //Dropdown Menu

    const [isOpen, setIsOpen] = useState(false);

    //Tweet Edit
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    //Pagination
    const [page, setPage] = useState(1);



    const loadComments = async () => {

        const postData = {
            "TweetId": TweetId,
            "Page": page
        }

        try {

           

            const response = await apiClient.post('/showCommentsOnTweet', postData);

            if (response.data.Comments) {
                setCommentOnTweets(previousComments => [...response.data.Comments, ...(previousComments || [])]);
            }


        } catch (error) {
            console.error('Error getting comments on tweet');
        }


    }
    useEffect(() => {
        loadComments()
    }, [page]) //reloadComment


    const handleComment = async (e: any) => {
        setShowCommentBox(!showCommentBox);
    }

    const handleCommentChange = (e: { target: { value: React.SetStateAction<string> } }) => {
        setCommentBoxValue(e.target.value);
    }

    const handleCommentSubmit = async (e: any) => {
        e.preventDefault();

        const postData = {
            "UserId": user.user.Id,
            "TweetId": TweetId,
            "Content": commentBoxValue
        }

        try {
            const response = await apiClient.post('/submitComment', postData);

        //     const newComment= {
        //         Id: 0,
        //         TweetId: TweetId,
        //         UserId: user.user.Id,
        //         TweetComment: commentBoxValue,
        //         Email: user.user.Email,
        //         FirstName: user.user.FirstName,
        //         LastName: user.user.LastName
          
        //     }
        //    setCommentOnTweets(previousComments => [...(previousComments || []), newComment]);

        } catch (error) {
            console.error('Error while submitting comment');
        }
        setCommentBoxValue('');

    }


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

    const getCommentCount = async () => {

        const postData = {
            "TweetId": TweetId
        }
        try {
            const response = await apiClient.post('/getTotalCommentOnTweet', postData);
            settotalComments(response.data.Count)

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


    useEffect(() => {
        getCommentCount()
    }, [commentOnTweets])

    useEffect(() => {
        ifLiked()
        getLikes()

    }, [likePressed])

    const handleEdit = () => {
        setIsEditing(true);
        setIsOpen(!isOpen)
    }

    const handleContentChange = (e: { target: { value: React.SetStateAction<string> } }) => {
        setEditedContent(e.target.value);
    }
    const handleCommentEdit = async () => {

        const postData = {
            "TweetId": TweetId,
            "Content": editedContent
        }

        try {
            const response = await apiClient.put('/updateTweetContent', postData);
            setIsEditing(false);
            setContentOfTweet(editedContent)

        } catch (error) {
            console.error('Error updating tweet content');
        }

    }

    function handleDelete() {
        onDelete(TweetId);
    }

    const handlePrevious = () => {
        setPage(oldPage => oldPage + 1);
    }


    return (
        <div className="w-9/12 border-2 border-gray-100 mb-2 bg-white" >
            <div className=" flex py-3 justify-between">

                <div className='flex px-2 ' >
                    <Image className="h-16 w-16 mr-2 rounded-full h" src={dummy} alt="" />

                    <div className='flex-col px-1 pt-1'>
                        <h2 className="text-2xl ">{FirstName} {LastName}</h2>
                        <h2 className='text-m text-purple-700 text-opacity-50'>{email}</h2>
                    </div>
                </div>

                {
                    user.user.Email === email ?
                        <div className='mr-4'>
                            <button
                                className="text-2xl"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                &hellip;
                            </button>

                            {isOpen && (
                                <div className="absolute mt-2 bg-white rounded-md shadow-lg">
                                    <button className="block px-4 py-2 hover:bg-gray-100" onClick={handleEdit}>Edit</button>
                                    <button className="block px-4 py-2 hover:bg-gray-100" onClick={handleDelete}>Delete</button>
                                </div>
                            )}
                        </div>

                        :
                        <div>
                        </div>

                }



            </div>

            {
                user.user.Email === email ?
                    <div>
                        {isEditing ?

                            <div>
                                <textarea value={editedContent} onChange={handleContentChange} className="w-full px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <br></br>
                                <button className=" mt-1 self-start px-1  py-1 text-white bg-blue-400 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleCommentEdit}>Save</button>
                            </div>
                            :
                            <div className="py-1 px-2">
                                <p className='text-xl'>{contentOfTweet}</p>
                            </div>
                        }

                    </div>
                    :
                    <div className="py-1 px-2">
                        <p className='text-xl'>{content}</p>
                    </div>
            }




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
                    <span className="text-xl">{totalComments}</span>
                </button>
            </div>

            {showCommentBox &&

                <div>
                    <button className="ml-2 underline" onClick={handlePrevious}>
                        Load previous..
                    </button>

                    <div>
                        {commentOnTweets && commentOnTweets.map((comment: TweetComments, index: React.Key | null | undefined) => (


                            <div className='py-2 pl-5 bg-blue-50' key={index}>

                                <div className='flex'>

                                    <div>

                                    </div>
                                    <Image className="lg:h-5 lg:w-5 h-3 w-3 rounded-full h mr-2" src={dummy} alt="" />
                                    <span className="hidden md:inline-block lg:text-xl">{comment.FirstName} {comment.LastName}</span>
                                </div>

                                <div>
                                    <span>{comment.TweetComment}</span>
                                </div>

                            </div>
                        ))}
                    </div>


                    <div className='mt-2 py-2 border-t-2 border-gray-500 '>


                        <form onSubmit={handleCommentSubmit}>

                            <textarea value={commentBoxValue} onChange={handleCommentChange} className="w-full px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='Type your comment' />

                            <button className=" mt-1 self-start px-1  py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" type="submit">Comment</button>
                        </form>

                    </div>

                </div>



            }


        </div>


    )
}

export default Tweet