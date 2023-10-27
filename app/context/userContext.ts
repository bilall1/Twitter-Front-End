// context/MyContext.js


import { createContext, Dispatch, SetStateAction } from 'react';

interface UserState {
    Id: number;
    Email: string;
    Password: string;
    ThirdParty: boolean;
    D_o_b: string;
    FirstName: string;
    LastName: string;
    Profile: string;
}

interface MyContextType {
    userState: UserState;
    setUserState: Dispatch<SetStateAction<UserState>>;
}

const MyContext = createContext<MyContextType | null>(null);

export default MyContext;