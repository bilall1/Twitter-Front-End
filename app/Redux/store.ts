// import { configureStore } from '@reduxjs/toolkit'
// import userReducer from './features/user/userSlice'

// const store = configureStore({
//   reducer: {
//     user: userReducer
//   }
// })

// export default store
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/es/storage";

const persistConfig = {
  key: "auth",
  version: 1,
  storage: storage,
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
