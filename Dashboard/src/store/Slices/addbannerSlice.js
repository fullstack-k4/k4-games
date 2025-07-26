import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";


const initialState = {
    loading: false,
    adbanners: [],
    deleted: false,
    deleting: false,
}



export const createAdBanner = createAsyncThunk(
    'createAdBanner',
    async (data) => {
        const formData = new FormData();

        if (data.image) {
            formData.append('image', data.image[0]);
        } else {
            if (data.imageUrl) {
                formData.append('imageUrl', data.imageUrl);
            }
        }

        if (data.link) {
            formData.append('link', data.link);
        }

        if (data.adsenseId) {
            formData.append('adsenseId', data.adsenseId);
        }

        if (data.position) {
            formData.append('position', data.position);
        }

        if (data.type) {
            formData.append('type', data.type);
        }


        try {
            const response = await axiosInstance.post("adbanner/create", formData);
            toast.success("AdBanner Created Successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error Creating Ad Banner", error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const deleteAdBanner = createAsyncThunk(
    'deleteAdBanner',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`adbanner/delete/${id}`);
            toast.success("AdBanner Deleted Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)


export const getAllAdBanners = createAsyncThunk(
    'getAllAdBanners',
    async () => {
        try {
            const response = await axiosInstance.get("adbanner/getall");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error) || "Something went wrong";
            throw error;
        }
    }

)





const adBannerSlice = createSlice({
    name: "adbanner",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createAdBanner.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(createAdBanner.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(createAdBanner.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteAdBanner.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteAdBanner.fulfilled, (state) => {
            state.deleting = false;
            state.deleted = !state.deleted;
        })
        builder.addCase(deleteAdBanner.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(getAllAdBanners.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllAdBanners.fulfilled, (state, action) => {
            state.loading = false;
            state.adbanners = action.payload;
        })
        builder.addCase(getAllAdBanners.rejected, (state) => {
            state.loading = false;
        })
    }
})


export default adBannerSlice.reducer;


