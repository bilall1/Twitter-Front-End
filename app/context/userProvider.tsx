// context/MyProvider.js

"use client"

import React, { useState } from 'react';
import MyContext from './userContext';

const MyProvider = ({ children }:any) => {
    const [userState, setUserState] = useState({
        Id: 0,
        Email: "",
        Password: "",
        ThirdParty: false,
        D_o_b: "",
        FirstName: "",
        LastName: "",
        Profile: "",
    });

    return (
        <MyContext.Provider value={{ userState, setUserState }}>
            {children}
        </MyContext.Provider>
    );
}

export default MyProvider;
