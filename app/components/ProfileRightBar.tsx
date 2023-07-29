import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import apiClient from '../api/api'
import { useSession } from 'next-auth/react'
import dummy from "../assets/dummy.png"

const ProfileRightBar = () => {

    const [followingPage, setFollowingPage] = useState(1);
    const [followerPage, setFollowerPage] = useState(1);

    const [followings, setFollowings] = useState<User[] | null>(null);
    const [followers, setFollowers] = useState<User[] | null>(null);

    interface User {
        Id: string
        FirstName: string
        LastName: string
        Followed: boolean
    }

    const { data: session } = useSession({
        required: true
    })
    const userEmail = session?.user?.email || 'invalid'



    const retrievefollowing = async () => {

        const postData = {
            "Email": userEmail,
            "Page": followingPage
        }
        try {
            const response = await apiClient.post('/getFollowing', postData);
            setFollowings(prevFollowings => {
                if (prevFollowings) {
                    return [...prevFollowings, ...response.data.Following];
                } else {
                    return response.data.Following;
                }
            });

        } catch (error) {
            console.error('Error while retrieving user followings');
        }

    }
    const divRef = useRef<HTMLDivElement | null>(null);

    const handleScrollForFollowing = (event: Event) => {
        const target = event.target as HTMLDivElement;
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (clientHeight + scrollTop !== scrollHeight) return;
        setFollowingPage(oldPage => oldPage + 1);
    };

    useEffect(() => {
        const div = divRef.current;
        if (div) {
            div.addEventListener('scroll', handleScrollForFollowing);
        }
        return () => {
            if (div) {
                div.removeEventListener('scroll', handleScrollForFollowing);
            }
        };
    }, []);



    const retrievefollowers = async () => {

        const postData = {
            "Email": userEmail,
            "Page": followerPage
        }
        try {
            const response = await apiClient.post('/getFollowers', postData);
            setFollowers(prevFollowers => {
                if (prevFollowers) {
                    return [...prevFollowers, ...response.data.Followers];
                } else {
                    return response.data.Followers;
                }
            });
        } catch (error) {
            console.error('Error while retrieving user followers');
        }

    }
    const divRef1 = useRef<HTMLDivElement | null>(null);

    const handleScrollForFollower = (event: Event) => {
        const target = event.target as HTMLDivElement;
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (clientHeight + scrollTop !== scrollHeight) return;
        setFollowerPage(oldPage => oldPage + 1);
    };

    useEffect(() => {
        const div = divRef1.current;
        if (div) {
            div.addEventListener('scroll', handleScrollForFollower);
        }
        return () => {
            if (div) {
                div.removeEventListener('scroll', handleScrollForFollower);
            }
        };
    }, []);

    useEffect(() => {
        retrievefollowing()
    }, [userEmail,followingPage])

    useEffect(() => {
        retrievefollowers()
    }, [userEmail])

    const handleUnfollow = async (userId: string) => {
        const postData = {
            "Email": userEmail,
            "FollowerId": userId
        }
        try {
            const response = await apiClient.post('/deleteFollower', postData);

            if (response.status === 200) { 
                setFollowings(prevFollowings => prevFollowings?.filter(user => user.Id !== userId) || null);
            } else {
                console.error('Error while unfollowing user');
            }
        } catch (error) {
            console.error('Error while unfollowing user');
        }
    }


    return (

        <div className='w-1/3 h-full flex flex-col pt-14 '>

            <div className='fixed flex flex-col justify-between'>

                <div> 

                    <div className='border-b-2 border-gray-500 opacity-50 pb-4'>
                        <span className='text-2xl '> Following</span>
                    </div>

                    <div className='pt-2' ref={divRef} style={{ height: '300px', overflow: 'auto', scrollbarWidth: 'none' }}>

                        {followings && followings.map((user: User, index: React.Key | null | undefined) => (
                            <div className='pl-3 pt-3 flex-col py-2' key={index}>
                                <div className='flex'>
                                    <Image className="lg:h-10 lg:w-10 h-6 w-6 rounded-full h mr-2" src={dummy} alt="" />
                                    <span className="hidden md:inline-block lg:text-2xl">{user.FirstName} {user.LastName}</span>
                                </div>

                                <div>
                                    <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 ml-10 px-2 rounded-full"
                                        onClick={() => handleUnfollow(user.Id)}
                                    >
                                        {user.Followed ? 'Removed' : 'Unfollow'}
                                    </button>
                                </div>

                            </div>
                        ))}


                    </div>

                </div>


                <div >


                    <div className='border-b-2 border-gray-500 opacity-50 pb-4 mt-8'>
                        <span className='text-2xl '> Followers</span>

                        {/* Followers route created at backend. Call and map simple  */}
                    </div>

                    <div className='pt-2' ref={divRef} style={{ height: '300px', overflow: 'auto', scrollbarWidth: 'none' }}>

                        {followers && followers.map((user: User, index: React.Key | null | undefined) => (
                            <div className='pl-3 pt-3 flex-col py-2' key={index}>
                                <div className='flex'>
                                    <Image className="lg:h-10 lg:w-10 h-6 w-6 rounded-full h mr-2" src={dummy} alt="" />
                                    <span className="hidden md:inline-block lg:text-2xl">{user.FirstName} {user.LastName}</span>
                                </div>


                            </div>
                        ))}

                    </div>

                </div>






            </div>



        </div>

    )
}

export default ProfileRightBar