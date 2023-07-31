'use client'

import {SessionProvider} from 'next-auth/react'

const Provider1 = ({children})=>{
    return <SessionProvider >
        {children}
    </SessionProvider>
}

export default Provider1