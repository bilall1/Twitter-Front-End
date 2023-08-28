import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import apiClient from "../../api";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials, req) {
        
        const response = await apiClient.get(`/validateUser?Email=${credentials.email}&Password=${credentials.password}`);

        if (response) {
          return {
            email: credentials.email,
          };
        } else {
          return 0;
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/Signin",
  },

  callbacks: {
    async signIn(user, account, profile) {
      if (user.account.type == "credentials") {
        return true;
      } else {
        try {
          const postData = {
            Email: user.user.email,
            Password: "",
            ThirdParty: true,
            FirstName: user.profile.given_name,
            LastName: user.profile.family_name,
            D_o_b: "",
          };

          const response = await apiClient.post("/createUser", postData);
        } catch (error) {
          console.error("User already exists!!");
        }
        return true;
      }
    },
    async jwt({ token, account, user }) {
      if (user) {
        if (account.type != "credentials") {
          token.accessToken = account.id_token;
        } else {
          const response = await apiClient.get(`/generateToken?Email=${user?.email}`);
          token.accessToken = response.data.token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
