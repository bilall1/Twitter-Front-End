import React, { useEffect, useState } from 'react'
import apiClient from '../api/api';
import { useSession } from 'next-auth/react';
import Tweet from './Tweet';


const homeMidSection = () => {
    const { data: session } = useSession({
        required: true
    })

    interface Tweet {
        ID: string;
        Content: string;
        Email: string;
        FirstName: string;
        LastName: string;
        // include other properties of a tweet as necessary
    }

    interface TweetsData {
        Tweets: Tweet[];

    }

    const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email
    const [tweets, setTweets] = useState<TweetsData | null>(null);

    const retrieveTweets = async () => {
        const postData = {
            "Email": userEmail
        }
        try {
            const response = await apiClient.post('/getFollowersTweet', postData);
            console.log(response.data);
            setTweets(response.data);
        } catch (error) {
            console.error('Error while retrieving home tweets:');
        }
    }

    useEffect(() => {
        retrieveTweets()
    }, [userEmail])



    const [content, setContent] = useState('');


    const handleContentChange = (event: { target: { value: any } }) => {
        const value = event.target.value;
        setContent(value);
    };

    const handleSubmit = async (e: any) => {
        const userEmail = session?.user?.email || 'invalid'

        //Post tweet request to data base 

        const postData = {
            "Email": userEmail,
            "Content": content
        }

        const response = await apiClient.post('/postTweet', postData);
        console.log('Tweet Response:', response.data);

    };
    return (
        <div className='w-full h-full flex flex-col pt-12'>

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
                {tweets && tweets.Tweets && tweets.Tweets.map((tweet: { ID: string, Content: string, FirstName: string, LastName: string, Email: string }, index: React.Key | null | undefined) => (
                    <div className='pb-2' key={index}>
                        <Tweet key={index} email={tweet.Email} content={tweet.Content} FirstName={tweet.FirstName} LastName={tweet.LastName} />
                    </div>

                ))}

            </div>

            {/* <button onClick={() => signOut()}>
          Sign Out
        </button> */}
        </div>

    )
}

export default homeMidSection