//React
import React, { useEffect, useState } from "react";
import apiClient from "../api/api";
import { useSession } from "next-auth/react";
import Tweet from "./Tweet";

//Hooks/Storage
import { useAppSelector } from "../Redux/hooks";
import { storage } from "../Firebase/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

//Images
import Image from "next/image";
import cross from "../assets/cross.png";
import { ThreeDots } from "react-loader-spinner";
import dummy from "../assets/dummy.png";
import upload from "../assets/upload.png"

//Interfaces
import { MySession, TweetUser } from "../Interfaces/interface";

//Shared
import { genRandonString } from "../Shared/sharedFunctions";
import { resizeFile } from "../Shared/sharedFunctions";

const homeMidSection = () => {
  //Redux store
  const user = useAppSelector((state) => state.user);

  //Component Re-render
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);

  //Tweet Handling
  const [imageSet, setImageSet] = useState(false);
  const [tweets, setTweets] = useState<TweetUser[] | null>(null);
  const [page, setPage] = useState(1);

  //Picture with tweet
  const [content, setContent] = useState("");
  const [image, setImage] = useState<any>(null);
  const [selected, setSelected] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  //Session
  const { data: session } = useSession({
    required: true,
  });
  const userEmail = session?.user?.email || "invalid";

  //Header
  const config = {
    headers: {
      Authorization: `Bearer ${(session as MySession)?.accessToken}`,
      ThirdParty: user.user.ThirdParty,
    },
  };

  //useEffects

  useEffect(() => {
    if (userEmail != "invalid" && user.user.Email != "") {
      retrieveTweets();
    }
  }, [userEmail, page, user.user.Email]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setReloading(false);
  }, [tweets]);

  //Functions

  const retrieveTweets = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/getFollowersTweet?Id=${user.user.Id}&Page=${page}`,
        config
      );
      setTweets((oldTweets) =>
        oldTweets
          ? [...oldTweets, ...response.data.Tweets]
          : response.data.Tweets
      );
      reloading;
    } catch (error) {
      console.error("Error while retrieving home tweets:");
    }
    setLoading(false);
    setReloading(false);
  };

  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop !== scrollHeight) return;
    setPage((oldPage) => oldPage + 1);
  };

  const handleContentChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setContent(value);
  };

  const handleSubmit = async (e: any) => {
    setImageSet(false);
    setRequestComplete(true);
    setSelected(false);
    setContent("");

    try {
      if (image) {
        const imageRef = ref(storage, "tweets/" + genRandonString());

        uploadBytes(imageRef, image)
          .then(() => {
            getDownloadURL(imageRef)
              .then(async (url) => {
                if (url) {
                  setUrl(url);

                  const postData = {
                    Id: user.user.Id,
                    Content: content,
                    Link: url,
                  };

                  const response = await apiClient.post(
                    "/postTweet",
                    postData,
                    config
                  );

                  var object: TweetUser = {
                    Id: response.data.Tweet.Id,
                    Content: response.data.Tweet.Content,
                    Email: user.user.Email,
                    FirstName: user.user.FirstName,
                    LastName: user.user.LastName,
                    Profile: user.user.Profile,
                    Link: url,
                  };
                  setTweets((oldTweets) =>
                    oldTweets ? [object, ...oldTweets] : null
                  );
                  setReloading(true);
                  setRequestComplete(false);
                }
              })
              .catch((error: { message: any }) => {
                console.log(error.message, "error getting the image url");
              });
            setImage(null);
          })
          .catch((error: { message: any }) => {
            console.log(error.message);
          });
      } else {
        const postData = {
          Id: user.user.Id,
          Content: content,
          Link: null,
        };
        const response = await apiClient.post("/postTweet", postData, config);

        var object: TweetUser = {
          Id: response.data.Tweet.Id,
          Content: response.data.Tweet.Content,
          Email: user.user.Email,
          FirstName: user.user.FirstName,
          LastName: user.user.LastName,
          Profile: user.user.Profile,
          Link: url,
        };
        setTweets((oldTweets) => (oldTweets ? [object, ...oldTweets] : null));
        setReloading(true);
        setRequestComplete(false);
      }
    } catch (error) {
      console.error("Error posting content");
    }
  };
  const deleteTweet = async (id: number) => {
    try {
      const response = await apiClient.delete(`/deleteTweet?Id=${id}`,config);

      setTweets((oldTweets) =>
        oldTweets ? oldTweets.filter((tweet) => tweet.Id !== id) : []
      );
      setReloading(true);
    } catch (error) {
      console.error("Error while retrieving home tweets:");
    }
  };

  const handleImageChange = async (e: any) => {
    if (e.target.files[0]) {
      const image = await resizeFile(e.target.files[0]);
      setImageSet(true);
      setImage(image);
      setSelected(!selected);
    }
  };

  const removeSelectedImage = () => {
    setImage(null);
    setSelected(!selected);
  };

  return (
    <div className=" w-11/12 h-full flex flex-col pt-5 lg:pt-16 md:ml-3 md:pt-8">
      <h1 className="font-semibold font-sans text-2xl lg:text-3xl md:text-2xl text-gray-900 dark:text-white px-2 pl-5">Home</h1>

      <div className="lg:w-9/12 md:w-11/12 flex py-2 px-2 ">
        <div className="flex flex-col justify-between w-full mr-2">
          <div className="flex">
            {user.user.Profile ? (
              <Image
                className="rounded-full h-12 w-12 ml-2 mt-2 "
                src={user.user.Profile}
                alt="Profile"
                width={100}
                height={100}
              />
            ) : (
              <Image
                src={dummy}
                alt="User avatar"
                className="w-12 h-12 rounded-full ml-2 mt-2"
              />
            )}
            <textarea
              className="text-sm mt-2 lg:mt-6 md:mt-6 ml-2 px-2 py-1 lg:py-2 md:py-2 border w-full border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={200}
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="Share your thoughts!"
            />
          </div>

          <div>
            {selected ? (
              <div className="py-1 ml:10 lg:ml-20 md:ml-20 w-1/2">
                <button>
                  <Image
                    src={cross}
                    alt="Delete"
                    className="h-8 w-8 "
                    onClick={removeSelectedImage}
                  />
                </button>

                {imageSet && (
                  <img
                    src={URL.createObjectURL(image)}
                    className="rounded-3xl"
                  />
                )}
              </div>
            ) : (
              <div className="ml-16">
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="py-2 text-sm text-stone-500 file:mr-5 file:py-1 file:px-3 file:border-[1px]
                                    file:text-xs file:font-medium
                                    file:bg-stone-50 file:text-stone-700
                                    hover:file:cursor-pointer hover:file:bg-blue-50
                                    hover:file:text-blue-700 w-full"
                />
              </div>
            )}
          </div>
        </div>

        <br></br>
        <div className="py-4">
          <button
            className="text-sm self-start px-1 mt-1 lg:mt-4 md:mt-4 py-1 bg-blue-400 rounded-md "
            type="submit"
            onClick={handleSubmit}
          >
             Post
          </button>
        </div>
      </div>

      <div></div>

      {requestComplete && (
        <div className="lg:w-9/12 md:w-11/12 flex items-center justify-center">
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
      )}

      <div className="py-4 ml-4">
        {!reloading ? (
          <div>
            {tweets &&
              tweets.map(
                (tweet: TweetUser, index: React.Key | null | undefined) => (
                  <div className="pb-2" key={index}>
                    <Tweet
                      email={tweet.Email}
                      content={tweet.Content}
                      FirstName={tweet.FirstName}
                      LastName={tweet.LastName}
                      TweetId={tweet.Id}
                      Profile={tweet.Profile}
                      onDelete={deleteTweet}
                      Link={tweet.Link}
                    />
                  </div>
                )
              )}
            {/* {loading && <p>Loading...</p>} */}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default homeMidSection;
