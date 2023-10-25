'use client'

// import {Provider} from 'react-redux'
// import store from "../Redux/store"

// const ReduxProvider = ({children})=>{
//     return <Provider store={store} >
//         {children}
//     </Provider>
// }

// export default ReduxProvider

import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import store from "../Redux/store"

const ReduxProvider = ({children})=>{
  let persistor;

  if (store) {
    persistor = persistStore(store, {}, function () {
      persistor.persist();
    });
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} />
      {children}
    </Provider>
  );
}
export default ReduxProvider