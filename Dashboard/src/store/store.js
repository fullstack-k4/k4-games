import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js"
import gameSliceReducer from "./Slices/gameSlice.js"




const store=configureStore({
    reducer:{
        auth:authSliceReducer,
        game:gameSliceReducer
    }
})

export default store;