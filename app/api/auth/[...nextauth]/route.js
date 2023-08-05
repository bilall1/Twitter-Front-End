import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import apiClient from "../../api"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,

        }),
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials, req) {

                const postData = {
                    "Email": credentials.email,
                    "Password": credentials.password
                };

                const response = await apiClient.post('/validateUser', postData);
                console.log('Response:', response.data);

                if(response){

                }
                else{
                    return 0
                }


                return {
                    email: credentials.email
                }
            }
        })
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: "/Signin"
    },

    callbacks: {

        async signIn(user, account, profile) {  
          

            if (user.account.type == 'credentials') {
                return true
            }
            else {
                try {
                    const postData = {
                        "Email": user.user.email,
                        "Password": "",
                        "ThirdParty": true,
                        "FirstName":user.profile.given_name,
                        "LastName":user.profile.family_name,
                        "D_o_b": ""
                    };


                    const response = await apiClient.post('/createUser', postData);
                    console.log('Response:', response.data);

                } catch (error) {
                    console.error('User already exists!!', );
                }
                return true

            }


        }
        // async jwt({ token, account }) {
        //     if (account) {
        //       token.accessToken = account.access_token
        //     }
        //     return token
        //   },
        // async session({ session, token, user }) {
        //     // Send properties to the client, like an access_token from a provider.
        //     session.accessToken = token.accessToken
        //     return session
        //   }
    }
})


export { handler as GET, handler as POST }