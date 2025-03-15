import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";


const initialState = {
    loading: false,
    apps: [],
    deleted: false,
    deleting: false
}


export const createApp = createAsyncThunk(
    'createApp',
    async (data) => {

        const formData = new FormData();
        if (data.image) {
            formData.append('image', data.image[0]);
        } else {
            formData.append('imageUrl', data.imageUrl);
        }
        formData.append('link', data.link);

      

        try {
            const response = await axiosInstance.post("moreapp/create", formData);
            toast.success("App Created Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Something went wrong");
            throw error;
        }
    }
);


export const getAllApps = createAsyncThunk(
    'getAllApps',
    async () => {
        try {
            const response = await axiosInstance.get("moreapp/getall");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;

        }
    }
)


export const deleteApp = createAsyncThunk(
    'deleteApp',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`moreapp/delete/${id}`);
            toast.success("App Deleted Successfully");
            return {id};
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createApp.pending, (state, action) => {
            state.loading = true;
        })
        builder.addCase(createApp.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(createApp.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteApp.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteApp.fulfilled, (state, {id}) => {
                   state.apps.filter((p) => p.id !== id);
                   state.deleting = false;
                   state.deleted = !state.deleted;
               })
        builder.addCase(deleteApp.rejected, (state) => {
            state.deleting = false;
            state.deleted=false;
        })
        builder.addCase(getAllApps.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllApps.fulfilled, (state, action) => {
            state.loading = false;
            state.apps = action.payload;
        })
        builder.addCase(getAllApps.rejected,(state,action)=>{
            state.loading=false;
        })

    }
})



export default appSlice.reducer;