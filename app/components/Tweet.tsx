//React
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../Redux/hooks";
import apiClient from "../api/api";
//Images
import Image from "next/image";
import like from "../assets/like.png";
import comment from "../assets/comment.png";
import dummy from "../assets/dummy.png";
import heartFilled from "../assets/heart-filled.png";
import done from "../assets/done.png";
//Interface
import {TweetComments} from "../Interfaces/interface"

interface ChildProps {
  TweetId: number;
  email: string;
  content: string;
  FirstName: string;
  LastName: string;
  Profile: string;
  Link: string | null;
  onDelete: (id: number) => void;
}

const Tweet: React.FC<ChildProps> = ({
  email,
  content,
  FirstName,
  LastName,
  TweetId,
  Profile,
  Link,
  onDelete,
}) => {

  //Redux store
  const user = useAppSelector((state) => state.user);

  //Comments
  const [commentOnTweets, setCommentOnTweets] = useState<
    TweetComments[] | null
  >(null);
  const [reload, setReload] = useState(false);
  const [contentOfTweet, setContentOfTweet] = useState(content);
  const [totalComments, settotalComments] = useState(0);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentBoxValue, setCommentBoxValue] = useState("");
  //Likes
  const [likeResponse, setlikeResponse] = useState(0);
  const [likePressed, setlikePressed] = useState(0);
  const [totalLikes, settotalLikes] = useState(0);
  //Dropdown Menu
  const [isOpen, setIsOpen] = useState(false);
  //Tweet Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  //Limit
  const [limit, setLimit] = useState(3);

  //UseEffects

  useEffect(() => {
    loadComments();
  }, [limit, reload]);

  useEffect(() => {
    getCommentCount();
  }, [commentOnTweets]);

  useEffect(() => {
    ifLiked();
    getLikes();
  }, [likePressed]);

  //Functions

  const loadComments = async () => {
    const postData = {
      TweetId: TweetId,
      Limit: limit,
    };

    try {
      const response = await apiClient.post("/showCommentsOnTweet", postData);

      if (response.data.Comments) {
        setCommentOnTweets(response.data.Comments);
      }
    } catch (error) {
      console.error("Error getting comments on tweet");
    }
  };

  const handleComment = async (e: any) => {
    setShowCommentBox(!showCommentBox);
  };

  const handleCommentChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setCommentBoxValue(e.target.value);
  };

  const handleCommentSubmit = async (e: any) => {
    e.preventDefault();

    const postData = {
      UserId: user.user.Id,
      TweetId: TweetId,
      Content: commentBoxValue,
    };

    try {
      const response = await apiClient.post("/submitComment", postData);
    } catch (error) {
      console.error("Error while submitting comment");
    }
    setCommentBoxValue("");

    setReload(!reload);
  };

  const ifLiked = async () => {
    const postData = {
      TweetId: TweetId,
      UserId: user.user.Id,
    };
    try {
      const response = await apiClient.post("/getIfTweetLiked", postData);
      setlikeResponse(response.data.Like);
    } catch (error) {
      console.error("Error getting if liked");
    }
  };

  const getLikes = async () => {
    const postData = {
      TweetId: TweetId,
    };
    try {
      const response = await apiClient.post("/getLikesOnTweet", postData);
      settotalLikes(response.data.Count);
    } catch (error) {
      console.error("Error getting likes on tweets");
    }
  };

  const getCommentCount = async () => {
    const postData = {
      TweetId: TweetId,
    };
    try {
      const response = await apiClient.post(
        "/getTotalCommentOnTweet",
        postData
      );
      settotalComments(response.data.Count);
    } catch (error) {
      console.error("Error getting likes on tweets");
    }
  };

  const handleLike = async () => {
    const postData = {
      TweetId: TweetId,
      UserId: user.user.Id,
    };
    try {
      const response = await apiClient.post("/likeTweet", postData);

      if (likePressed == 0) {
        setlikePressed(1);
      } else {
        setlikePressed(0);
      }
    } catch (error) {
      console.error("Error liking the tweet");
    }
  };

  const handleUnLike = async () => {
    const postData = {
      TweetId: TweetId,
      UserId: user.user.Id,
    };
    try {
      const response = await apiClient.post("/unlikeTweet", postData);

      if (likePressed == 0) {
        setlikePressed(1);
      } else {
        setlikePressed(0);
      }
    } catch (error) {
      console.error("Error Unliking the tweet");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsOpen(!isOpen);
  };

  const handleContentChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setEditedContent(e.target.value);
  };
  const handleCommentEdit = async () => {
    const postData = {
      TweetId: TweetId,
      Content: editedContent,
    };

    try {
      const response = await apiClient.put("/updateTweetContent", postData);
      setIsEditing(false);
      setContentOfTweet(editedContent);
    } catch (error) {
      console.error("Error updating tweet content");
    }
  };

  function handleDelete() {
    setIsOpen(!isOpen);
    onDelete(TweetId);
  }

  const handlePrevious = () => {
    setLimit((oldLimit) => oldLimit + 3);
  };

  return (
    <div className="w-9/12 border-2 border-gray-100 mb-2 bg-white">
      <div className=" flex py-3 justify-between">
        <div className="flex px-2 ">
          {Profile ? (
            <Image
              className="rounded-full h-12 w-12 ml-2 mt-2 "
              src={Profile}
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

          <div className="flex-col px-4 pt-1">
            <h2 className="text-2xl ">
              {FirstName} {LastName}
            </h2>
            <h2 className="text-m text-gray-600 text-opacity-60">{email}</h2>
          </div>
        </div>

        {user.user.Email === email ? (
          <div className="mr-4">
            <button className="text-2xl" onClick={() => setIsOpen(!isOpen)}>
              &hellip;
            </button>

            {isOpen && (
              <div className="absolute mt-2 bg-white rounded-md shadow-lg">
                <button
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          <></> 
        )}
      </div>

      {user.user.Email === email ? (
        <div>
          {isEditing ? (
            <div className="py-1 px-20">
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="w-full px-2 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <br></br>
              <button
                className=" mt-1 self-start px-1  py-1 text-white bg-blue-400 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handleCommentEdit}
              >
                Save
              </button>

              <div className="py-2">
                {Link && <img src={Link} className="rounded-3xl " />}
              </div>
            </div>
          ) : (
            <div className="py-1 px-20">
              <p className="text-lg">{contentOfTweet}</p>
              <div className="py-2">
                {Link ? (
                  <img src={Link} className="py-1 rounded-3xl" />
                ) : (
                  <></> 
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-1 px-20">
          <p className="text-lg">{content}</p>

          <div className="py-2">
            {Link ? <img src={Link} className="py-1" /> : <div></div>}
          </div>
        </div>
      )}

      <div className="flex px-2 pt-8 py-2">
        {likeResponse ? (
          <button className="px-2 flex" onClick={handleUnLike}>
            <Image className="h-8 w-8 mr-2 " src={heartFilled} alt="HeartFilledIcon" />
            <span className="text-xl">{totalLikes}</span>
          </button>
        ) : (
          <button className="px-2 flex" onClick={handleLike}>
            <Image className="h-8 w-8 mr-2 " src={like} alt="LikeIcon" />
            <span className="text-xl">{totalLikes}</span>
          </button>
        )}

        <button className="px-4 flex" onClick={handleComment}>
          <Image className="h-8 w-8 mr-2" src={comment} alt="CommentIcon" />
          <span className="text-xl">{totalComments}</span>
        </button>
      </div>

      {showCommentBox && (
        <div>
          <div className="mt-2 py-2 border-t-2 border-gray-500  bg-blue-50">
            <form onSubmit={handleCommentSubmit} className="flex">
              <textarea
                value={commentBoxValue}
                onChange={handleCommentChange}
                className="w-full h-10 px-1 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your comment"
              />

              <button className="" type="submit">
                <Image src={done} className="h-10 w-10" alt="PostCommentIcon" />
              </button>
            </form>
          </div>

          <div>
            {commentOnTweets &&
              commentOnTweets.map(
                (
                  comment: TweetComments,
                  index: React.Key | null | undefined
                ) => (
                  <div className="py-2 pl-2 bg-blue-50" key={index}>
                    <div className="flex">
                      <div></div>
                      {comment.Profile ? (
                        <Image
                          className="lg:h-8 lg:w-8 h-3 w-3 rounded-full mr-2"
                          src={comment.Profile}
                          alt="Profile"
                          width={100}
                          height={100}
                        />
                      ) : (
                        <Image
                          src={dummy}
                          alt="User avatar"
                          className="lg:h-8 lg:w-8 h-3 w-3 rounded-full mr-2"
                        />
                      )}
                      <span className="hidden md:inline-block lg:text-xl">
                        {comment.FirstName} {comment.LastName}
                      </span>
                    </div>

                    <div>
                      <span className="ml-10">{comment.TweetComment}</span>
                    </div>
                  </div>
                )
              )}
          </div>

          <button
            className="ml-2 w-full underline bg-blue-50 flex justify-start"
            onClick={handlePrevious}
          >
            Load previous..
          </button>
        </div>
      )}
    </div>
  );
};

export default Tweet;
