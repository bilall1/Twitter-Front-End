import axios from 'axios'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import apiClient from '@/app/api/api'

type User = {
  [x: string]: any
  Id: number
  Email: string
  Password: string
  ThirdParty: boolean
  D_o_b: string
  FirstName: string
  LastName: string
  Profile: string
}


type InitialState = {
  loading: boolean
  user: User
  error: string
}
const initialState: InitialState = {
  loading: false,
  user: {
    Id: 0,
    Email: "",
    Password: "",
    ThirdParty: false,
    D_o_b: "",
    FirstName: "",
    LastName: "",
    Profile : ""

  },
  error: ''
}

export const fetchUsers = createAsyncThunk('user/fetchUsers', async (email: string) => {

  const postData = {
    "Email": email
  }

  return apiClient
    .post('/getUser', postData)
    .then(response => response.data)
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUsers.pending, state => {
      state.loading = true
    })
    builder.addCase(
      fetchUsers.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload.user
        state.error = ''
      }
    )
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false
      state.user = {
        Id: 0,
        Email: "",
        Password: "",
        ThirdParty: false,
        D_o_b: "",
        FirstName: "",
        LastName: "",
        Profile : ""

      },
        state.error = action.error.message || 'Something went wrong'
    })
  }
})

export default userSlice.reducer