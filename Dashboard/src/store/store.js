import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js"
import gameSliceReducer from "./Slices/gameSlice.js"
import categorySliceReducer from "./Slices/categorySlice.js"
import dashboardSliceReducer from "./Slices/dashboardSlice.js"





const store=configureStore({
    reducer:{
        auth:authSliceReducer,
        game:gameSliceReducer,
        category:categorySliceReducer,
        dashboard:dashboardSliceReducer
    }
})

export default store;