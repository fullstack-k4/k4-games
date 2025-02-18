import axiosInstance from "@/helpers/axiosinstance";
import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";





const initialState={
    loading: false,
    userData: null,
    status: false,
    admin: false
}

export const userLogin=createAsyncThunk("login",async(data)=>{
    try {
        const response=await axiosInstance.post("/users/login",data);
        toast.success("Login Successful!");
        return response.data.data.user;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error; 
    }
})

export const userLogout=createAsyncThunk("logout",async()=>{
    try {
        const response=await axiosInstance.post("/users/logout");
        toast.success("Logout Succesfull");
        return response.data;
        
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})

export const getCurrentUser=createAsyncThunk("getCurrentUser",async()=>{
    const response=await axiosInstance.get("/users/getcurrentuser");
    return response.data.data;
})

const authSlice=createSlice({
    name:"auth",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(userLogin.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(userLogin.fulfilled,(state,action)=>{
            state.status=true;
            state.userData=action.payload;
            state.loading=false;
            sessionStorage.setItem("isAuthenticated","true");
        })
        builder.addCase(userLogin.rejected,(state,action)=>{
            state.loading=false;
            state.status=false;
            state.userData=null;
            
        })
        builder.addCase(userLogout.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(userLogout.fulfilled,(state,action)=>{
            state.loading=false;
            state.status=false;
            state.userData=null;
            sessionStorage.removeItem("isAuthenticated");
        })
        builder.addCase(getCurrentUser.fulfilled,(state,action)=>{
            state.status=true;
            state.loading=false;
            state.userData=action.payload;
        })
        builder.addCase(getCurrentUser.rejected,(state)=>{
            state.userData=null;
            state.status=false;
        })

    }
})


export default authSlice.reducer;