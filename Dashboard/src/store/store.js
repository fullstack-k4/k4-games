import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./Slices/authSlice.js"
import gameSliceReducer from "./Slices/gameSlice.js"
import categorySliceReducer from "./Slices/categorySlice.js"
import dashboardSliceReducer from "./Slices/dashboardSlice.js"
import popupSliceReducer from "./Slices/popupSlice.js"
import appSliceReducer from "./Slices/appSlice.js"
import formSliceReducer from "./Slices/formSlice.js";
import reportSliceReducer from "./Slices/reportSlice.js"
import pageSliceReducer from "./Slices/pageSlice.js"
import adBannerSliceReducer from "./Slices/addbannerSlice.js"

const store = configureStore({
    reducer: {
        auth: authSliceReducer,
        game: gameSliceReducer,
        category: categorySliceReducer,
        dashboard: dashboardSliceReducer,
        popup: popupSliceReducer,
        app: appSliceReducer,
        form: formSliceReducer,
        report: reportSliceReducer,
        page: pageSliceReducer,
        adbanner: adBannerSliceReducer
    }
})

export default store;