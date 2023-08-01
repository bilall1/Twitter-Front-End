import { useEffect, useState } from 'react';
import Image from "next/image";
import dummy from "../assets/dummy.png"
import { useSession } from 'next-auth/react';
import apiClient from '../api/api';
import { useAppSelector } from '../hooks';

export default function FollowList() {

    //Redux store 
    const user = useAppSelector(state => state.user)

    interface User {
        Id: string
        FirstName: string
        LastName: string
        Followed: boolean
        // include other properties of a tweet as necessary
    }

    interface UserData {
        people: User[];
    }

    const [toFollow, setToFollow] = useState<UserData | null>(null);
    const [changeInList, setChangeInList] = useState(0);

    const { data: session } = useSession({
        required: true
    })
    const userEmail = session?.user?.email || 'invalid' // Handle null session or missing email


    const retrievePeopleToFollow = async () => {

        try {

            const postData = {
                "Id": user.user.Id
            }

            const response = await apiClient.post('/getPeopleToFollow', postData);
            setToFollow(response.data)
        } catch (error) {
            console.error('Error loading people to follow');
        }

    }

    useEffect(() => {
        // if(userEmail!="Invalid"){
            retrievePeopleToFollow()
        // }
    }, [userEmail,changeInList,user.user])


    const handleFollow = async (userId: string) => {


        if (!toFollow) return;  // guard against null and undefined

        const updatedToFollow: UserData = {
            people: toFollow.people.map(user =>
                user.Id === userId ? { ...user, followed: !user.Followed } : user)
        };

        const userToFollow = updatedToFollow?.people?.find(user => user.Id === userId);

        if (userToFollow) {

            if (userToFollow.Followed) {
                //userToFollow.Followed = false;

            } else {

                try {

                    const postData = {
                        "UserId": user.user.Id,
                        "FollowerId": userId
                    }

                    const response = await apiClient.post('/addtofollowerList', postData);
                    setToFollow(response.data)
                } catch (error) {
                    console.error('Error adding people to followlist');
                }

                userToFollow.Followed = true;
            }

        }

        setToFollow(updatedToFollow);
        if(changeInList == 1){
            setChangeInList(0)

        }
        else{
            setChangeInList(1)
        }
        
    }


    return (
        //style={{ maxHeight: "290 px", overflowY: "scroll" }}
        <div className='mr-5'  >
            {toFollow && toFollow.people && toFollow.people.map((people: { Followed: boolean, Id: string, FirstName: string, LastName: string }, index: React.Key | null | undefined) => (
                <div className='pl-3 pt-3 flex-col py-2' key={index}>
                    <div className='flex'>
                        <Image className="lg:h-10 lg:w-10 h-6 w-6 rounded-full h mr-2" src={dummy} alt="" />
                        <span className="hidden md:inline-block lg:text-2xl">{people.FirstName} {people.LastName}</span>
                    </div>

                    <div>
                        <button className="self-start px-2 ml-12 py-1 text-white bg-blue-400 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => handleFollow(people.Id)}
                        >
                            {people.Followed ? 'Followed' : 'Follow'}
                        </button>
                    </div>

                </div>
            ))}
        </div>
    );
}
