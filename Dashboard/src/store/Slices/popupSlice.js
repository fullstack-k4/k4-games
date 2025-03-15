import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    popups: [],
    deleted: false,
    deleting: false
}


export const createPopUp = createAsyncThunk(
    'createPopUp',
    async (data) => {

        const formData = new FormData();
        if (data.image) {
            formData.append('image', data.image[0]);
        } else {
            formData.append('imageUrl', data.imageUrl);
        }
        formData.append('link', data.link);



        try {
            const response = await axiosInstance.post("popup/create", formData);
            toast.success("PopUp Created Successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error creating popup:", error);
            toast.error(error?.response?.data?.error || "Something went wrong");
            throw error;
        }
    }
);


export const getAllPopUp = createAsyncThunk(
    'getAllPopUp',
    async () => {
        try {
            const url = new URL(`${BASE_URL}/popup/getall`)
            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Something went wrong");
            throw error;
        }
    }
)


export const deletePopup = createAsyncThunk(
    'deletePopUp',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`popup/delete/${id}`);
            toast.success("Pop Up Deleted Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



const popupSlice = createSlice({
    name: "popup",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createPopUp.pending, (state, action) => {
            state.loading = true;
        })
        builder.addCase(createPopUp.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(createPopUp.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deletePopup.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deletePopup.fulfilled, (state, action) => {
            state.popups.filter((p) => p.id !== action.payload._id);
            state.deleting = false;
            state.deleted = !state.deleted;
        })
        builder.addCase(deletePopup.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(getAllPopUp.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllPopUp.fulfilled, (state, action) => {
            state.loading = false;
            state.popups = action.payload;
        })
        builder.addCase(getAllPopUp.rejected, (state, action) => {
            state.loading = false;
        })

    }
})



export default popupSlice.reducer;