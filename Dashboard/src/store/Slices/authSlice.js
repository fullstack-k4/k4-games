import axiosInstance from "@/helpers/axiosinstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

const initialState = {
    loading: false,
    userData: null,
    status: false,
    admin: false,
    secondaryAdmins: null,
}

export const userLogin = createAsyncThunk("login", async (data) => {
    try {
        const response = await axiosInstance.post("/users/login", data);
        toast.success("Login Successful!");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})

export const userLogout = createAsyncThunk("logout", async () => {
    try {
        const response = await axiosInstance.post("/users/logout");
        toast.success("Logout Succesfull");
        return response.data;

    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})

export const getCurrentUser = createAsyncThunk("getCurrentUser", async () => {
    const response = await axiosInstance.get("/users/getcurrentuser");
    return response.data.data;
})


export const registerUser = createAsyncThunk("registerUser", async (data) => {
    try {
        const response = await axiosInstance.post("/users/register", data);
        toast.success("User Created Successfully");
        return response.data.data;

    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})


export const getAllSecondaryAdmin = createAsyncThunk("getAllSecondaryAdmin", async () => {
    try {
        const response = await axiosInstance.get("/users/getAllSecondaryAdmin/");
        return response.data.data;

    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }

})

export const deleteSecondaryAdmin = createAsyncThunk("deleteSecondaryAdmin", async ({ id }) => {
    try {
        const response = await axiosInstance.delete(`/users/deleteSecondaryAdmin/${id}`);
        toast.success("User Deleted Succesfully");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }

})


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(userLogin.pending, (state) => {
            state.loading = true;
            state.admin = false;
        })
        builder.addCase(userLogin.fulfilled, (state, action) => {
            state.status = true;
            state.userData = action.payload;
            state.admin = action.payload.role === "admin" ? true : false;
            state.loading = false;
            sessionStorage.setItem("isAuthenticated", "true");
        })
        builder.addCase(userLogin.rejected, (state, action) => {
            state.loading = false;
            state.status = false;
            state.userData = null;

        })
        builder.addCase(userLogout.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(userLogout.fulfilled, (state, action) => {
            state.loading = false;
            state.status = false;
            state.userData = null;
            sessionStorage.removeItem("isAuthenticated");
        })
        builder.addCase(getCurrentUser.fulfilled, (state, action) => {
            state.status = true;
            state.loading = false;
            state.userData = action.payload;
            state.admin = action.payload.role === "admin" ? true : false;
            sessionStorage.setItem("isAuthenticated", "true");
        })
        builder.addCase(getCurrentUser.rejected, (state) => {
            state.userData = null;
            state.status = false;
            state.admin = false;
        })
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(registerUser.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(registerUser.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getAllSecondaryAdmin.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllSecondaryAdmin.fulfilled, (state, action) => {
            state.loading = false;
            state.secondaryAdmins = action.payload;
        })
        builder.addCase(getAllSecondaryAdmin.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteSecondaryAdmin.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(deleteSecondaryAdmin.fulfilled, (state, action) => {
            state.loading = false;
            state.secondaryAdmins = state.secondaryAdmins.filter((admin) => admin?._id !== action.payload._id);
        })
        builder.addCase(deleteSecondaryAdmin.rejected, (state) => {
            state.loading = false;
        })

    }
})




export default authSlice.reducer;