// Importing necessary functions and modules from Redux toolkit and Redux Persist
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice"; 
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import themeReducer from "./theme/ThemeSlice";
import persistStore from "redux-persist/es/persistStore";

// Combining the userReducer and themeReducer into a single root reducer
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
});

// Creating a configuration object for Redux Persist
// The key is the key for the persisted state in the storage engine
// Storage is the storage engine to use
// Version is the version of the state
const persistConfig = {
  key: "root",
  storage,
  version: 1,
};

// Creating a persisted reducer using the configuration and the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Creating a Redux store with the persisted reducer and some default middleware
// The serializableCheck: false option disables a check that ensures all actions and state are serializable
// This is necessary for some features of Redux Persist
export const store = configureStore({
  reducer: persistedReducer, // Use persistedReducer as the root reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Creating a persisted version of the store, which can be used to load and save the state
export const persistor = persistStore(store);
