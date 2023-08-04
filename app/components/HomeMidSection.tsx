import React, { useEffect, useState } from 'react'
import apiClient from '../api/api';
import { useSession } from 'next-auth/react';
import Tweet from './Tweet';
import { useAppSelector } from '../hooks';


const homeMidSection = () => {

    //Redux store 
    const user = useAppSelector(state => state.user)

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reloading, setReloading] = useState(0);


    const { data: session } = useSession({
        required: true
    })

    interface Tweet {
        Id: number;
        Content: string;
        Email: string;
        FirstName: string;
        LastName: string;
        // include other properties of a tweet as necessary
    }

    const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email
    const [tweets, setTweets] = useState<Tweet[] | null>(null);


    const retrieveTweets = async () => {
        //console.log(user)
        setLoading(true);
        const postData = {
            "Id": user.user.Id,
            "Page": page
        }
        try {
            const response = await apiClient.post('/getFollowersTweet', postData);
            setTweets(oldTweets => (oldTweets ? [...oldTweets, ...response.data.Tweets] : response.data.Tweets));

        } catch (error) {
            console.error('Error while retrieving home tweets:');
        }
        setLoading(false);
    }

    useEffect(() => {
        if(userEmail!="invalid" && user.user.Email!=''){
            retrieveTweets()
        }
    }, [userEmail, page, user.user.Email])

    const handleScroll = (event: any) => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (clientHeight + scrollTop !== scrollHeight) return;
        setPage(oldPage => oldPage + 1);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);



    const [content, setContent] = useState('');


    const handleContentChange = (event: { target: { value: any } }) => {
        const value = event.target.value;
        setContent(value);
    };

    const handleSubmit = async (e: any) => {
        const userEmail = session?.user?.email || 'invalid'

        //Post tweet request to data base 

        const postData = {
            "Id": user.user.Id,
            "Content": content
        }

        const response = await apiClient.post('/postTweet', postData);

    };
    const deleteTweet= async  (id: number)  => {

        const postData ={
            "TweetId":id
        }

        try {
            const response = await apiClient.post('/deleteTweet', postData);

            setTweets(oldTweets => (
                oldTweets 
                ? oldTweets.filter(tweet => tweet.Id !== id)
                : []
            ));

            if(reloading == 0){
                setReloading(1)
            }
            else{
                setReloading(0)
            }
            

        } catch (error) {
            console.error('Error while retrieving home tweets:');
        }


    }
    return (
        <div className='w-full h-full flex flex-col pt-16'>

            <div>
                <h1 className="text-3xl text-gray-900 dark:text-white px-2">Twitter </h1>
            </div>

            <div className="w-9/12 flex flex-col py-2 px-2">

                <div className='flex flex-col justify-between'>

                    <textarea className="px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={100} id="content" value={content} onChange={handleContentChange} placeholder='Share your thoughts!' />

                    {/* <input className="py-2" type="file" id="picture" onChange={handlePictureChange} /> */}

                </div>

                <br></br>
                <div className='py-2'>
                    <button className="self-start px-2  py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" type="submit" onClick={handleSubmit}>Post</button>

                </div>

            </div>

            <div className="py-4 px-2">
                {tweets && tweets.map((tweet: Tweet, index: React.Key | null | undefined) => (
                    <div className='pb-2' key={index}>
                        <Tweet email={tweet.Email} content={tweet.Content} FirstName={tweet.FirstName} LastName={tweet.LastName} TweetId={tweet.Id} onDelete={deleteTweet}/>
                    </div>
                ))}
                {loading && <p>Loading...</p>}

            </div>

            {/* <button onClick={() => signOut()}>
          Sign Out
        </button> */}
        </div>

    )
}

export default homeMidSection