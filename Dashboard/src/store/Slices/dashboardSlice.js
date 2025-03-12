import axiosInstance from "@/helpers/axiosinstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";



const initialState={
    loading:false,
    dashboardData:null
}


export const getAllDashboardData=createAsyncThunk("getAllDashboardData",async()=>{
    try {
        const response=await axiosInstance.get("/dashboard/getall");
        return response.data.data;
        
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error; 
    }
})




const dashboardSlice=createSlice({
    name:"dashboard",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getAllDashboardData.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(getAllDashboardData.fulfilled,(state,action)=>{
            state.loading=false;
            state.dashboardData=action.payload;
        })
        builder.addCase(getAllDashboardData.rejected,(state)=>{
            state.loading=false;
        })

    }
})


export default dashboardSlice.reducer;