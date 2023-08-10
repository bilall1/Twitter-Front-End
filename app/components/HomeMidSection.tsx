import React, { useEffect, useState } from 'react'
import apiClient from '../api/api';
import { useSession } from 'next-auth/react';
import Tweet from './Tweet';
import { useAppSelector } from '../hooks';
import Image from 'next/image';
import cross from "../assets/cross.png"
import Resizer from "react-image-file-resizer";
import { link } from 'fs';
import { storage } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { RotatingLines, ThreeDots } from 'react-loader-spinner';
import dummy from "../assets/dummy.png"




const homeMidSection = () => {
    interface Tweet {
        Id: number;
        Content: string;
        Email: string;
        FirstName: string;
        LastName: string;
        Profile: string;
        Link: string | null;
        // include other properties of a tweet as necessary
    }

    //Redux store 
    const user = useAppSelector(state => state.user)

    //Component Re-render
    const [loading, setLoading] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [requestComplete, setRequestComplete] = useState(false);

    //Tweet Handling
    const [imageSet, setImageSet] = useState(false);
    const [tweets, setTweets] = useState<Tweet[] | null>(null);
    const [page, setPage] = useState(1);

     //Picture with tweet
     const [content, setContent] = useState('');
     const [image, setImage] = useState<any>(null);
     const [selected, setSelected] = useState(false);
     const [url, setUrl] = useState<string | null>(null);

    const { data: session } = useSession({
        required: true
    })

    const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email


    const retrieveTweets = async () => {
        setLoading(true);
        const postData = {
            "Id": user.user.Id,
            "Page": page
        }
        try {
            const response = await apiClient.post('/getFollowersTweet', postData);
            setTweets(oldTweets => (oldTweets ? [...oldTweets, ...response.data.Tweets] : response.data.Tweets));
            reloading

            console.log(response.data.Tweets)

        } catch (error) {
            console.error('Error while retrieving home tweets:');
        }
        setLoading(false);
        setReloading(false);
    }

    useEffect(() => {
        if (userEmail != "invalid" && user.user.Email != '') {
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

    useEffect(() => {
        setReloading(false)

    }, [tweets]);


    const handleContentChange = (event: { target: { value: any } }) => {
        const value = event.target.value;
        setContent(value);
    };



    function genRandonString(length = 12) {
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        var charLength = chars.length;
        var result = '';
        for (var i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * charLength));
        }
        return result;
    }


    const handleSubmit = async (e: any) => {

        setImageSet(false)
        setRequestComplete(true)
        setSelected(false)
        setContent("");

        const userEmail = session?.user?.email || 'invalid'

        //Post tweet request to data base 

        try {

            if (image) {

                const imageRef = ref(storage, "tweets/" + genRandonString());

                uploadBytes(imageRef, image)
                    .then(() => {
                        getDownloadURL(imageRef)
                            .then(async (url) => {
                                console.log('url: ', url)
                                if (url) {
                                    setUrl(url);

                                    const postData = {
                                        "Id": user.user.Id,
                                        "Content": content,
                                        "Link": url
                                    }
                                    const response = await apiClient.post('/postTweet', postData);

                                    var object: Tweet = {
                                        Id: response.data.Tweet.Id,
                                        Content: response.data.Tweet.Content,
                                        Email: user.user.Email,
                                        FirstName: user.user.FirstName,
                                        LastName: user.user.LastName,
                                        Profile: user.user.Profile,
                                        Link: url

                                    }
                                    setTweets(oldTweets => (oldTweets ? [object, ...oldTweets] : null));
                                    setReloading(true)
                                    setRequestComplete(false)

                                }
                            })
                            .catch((error: { message: any; }) => {
                                console.log(error.message, "error getting the image url");
                            });
                        setImage(null);
                    })
                    .catch((error: { message: any; }) => {
                        console.log(error.message);
                    });


            }
            else {
                const postData = {
                    "Id": user.user.Id,
                    "Content": content,
                    "Link": null
                }
                const response = await apiClient.post('/postTweet', postData);

                var object: Tweet = {
                    Id: response.data.Tweet.Id,
                    Content: response.data.Tweet.Content,
                    Email: user.user.Email,
                    FirstName: user.user.FirstName,
                    LastName: user.user.LastName,
                    Profile: user.user.Profile,
                    Link: url

                }
                setTweets(oldTweets => (oldTweets ? [object, ...oldTweets] : null));
                setReloading(true)


            }
        }
        catch (error) {
            console.error("Error posting content")

        }



    };
    const deleteTweet = async (id: number) => {

        const postData = {
            "TweetId": id
        }

        try {
            const response = await apiClient.post('/deleteTweet', postData);

            setTweets(oldTweets => (
                oldTweets
                    ? oldTweets.filter(tweet => tweet.Id !== id)
                    : []
            ));
            setReloading(true)

        } catch (error) {
            console.error('Error while retrieving home tweets:');
        }


    }



    const resizeFile = (file: Blob) => new Promise(resolve => {
        Resizer.imageFileResizer(file, 800, 800, 'jpg', 100, 0,
            uri => {
                resolve(uri);
                setImageSet(true)
            }, 'blob');
    });


    const handleImageChange = async (e: any) => {
        if (e.target.files[0]) {
            const image = await resizeFile(e.target.files[0]);
            console.log(image);
            setImage(image);
            setSelected(!selected)
        }
    }

    const removeSelectedImage = () => {
        setImage(null);
        setSelected(!selected)
    };

    return (

        <div className='w-full h-full flex flex-col pt-16'>

            <div>
                <h1 className="text-3xl text-gray-900 dark:text-white px-2">Twitter </h1>
            </div>

            <div className="w-9/12 flex py-2 px-2">

                <div className='flex flex-col justify-between w-full mr-2'>

                    <div className='flex'>
                        {user.user.Profile ? <Image className='rounded-full h-12 w-12 ml-2 mt-2 ' src={user.user.Profile} alt="Profile" width={100} height={100} /> : <Image src={dummy} alt="User avatar" className="w-12 h-12 rounded-full ml-2 mt-2" />}
                        <textarea className="mt-6 ml-2 px-2 py-2 border w-full border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={200} id="content" value={content} onChange={handleContentChange} placeholder='Share your thoughts!' />
                    </div>

                    <div>

                        {selected ?

                            <div className='py-1 ml-20'>
                                <button >
                                    <Image src={cross} alt="Delete" className='h-8 w-8 ' onClick={removeSelectedImage} />
                                </button>

                                {imageSet ?
                                    <img src={URL.createObjectURL(image)} className='rounded-3xl' />
                                    :
                                    <div></div>
                                }


                            </div>

                            :
                            <div className='ml-16'>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className=" py-2 text-sm text-stone-500 file:mr-5 file:py-1 file:px-3 file:border-[1px]
                                    file:text-xs file:font-medium
                                    file:bg-stone-50 file:text-stone-700
                                    hover:file:cursor-pointer hover:file:bg-blue-50
                                    hover:file:text-blue-700"
                                />

                            </div>


                        }

                    </div>

                </div>

                <br></br>
                <div className='py-4'>
                    <button className="self-start px-2 mt-4 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" type="submit" onClick={handleSubmit}>Post</button>
                </div>

            </div>

            <div>

            </div>

            {requestComplete ?
                <div className='w-9/12 flex items-center justify-center'>
                    <ThreeDots
                        height="80"
                        width="80"
                        radius="9"
                        color="#4fa94d"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        visible={true}
                    />
                </div>
                :
                <div></div>
            }



            <div className="py-4 px-2">
                {!reloading ? <div>
                    {tweets && tweets.map((tweet: Tweet, index: React.Key | null | undefined) => (
                        <div className='pb-2' key={index}>
                            <Tweet email={tweet.Email} content={tweet.Content} FirstName={tweet.FirstName} LastName={tweet.LastName} TweetId={tweet.Id} Profile={tweet.Profile} onDelete={deleteTweet} Link={tweet.Link} />
                        </div>
                    ))}
                    {loading && <p>Loading...</p>}
                </div>
                    : <div>Loading...</div>}


            </div>

            {/* <button onClick={() => signOut()}>
          Sign Out
        </button> */}
        </div>

    )
}

export default homeMidSection