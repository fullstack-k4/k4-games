import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";


const initialState = {
    loading: false,
    adbannersweb: [],
    deleted: false,
    deleting: false,
}



export const createAdBannerweb = createAsyncThunk(
    'createAdBannerweb',
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


        if (data.position) {
            formData.append('position', data.position);
        }

        if (data.type) {
            formData.append('type', data.type);
        }

        try {
            const response = await axiosInstance.post("adbannerweb/create", formData);
            toast.success("AdBanner Web Created Successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error Creating Ad Banner Web", error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const deleteAdBannerweb = createAsyncThunk(
    'deleteAdBannerweb',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`adbannerweb/delete/${id}`);
            toast.success("AdBanner Web Deleted Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const getAllAdBannersweb = createAsyncThunk(
    'getAllAdBannersweb',
    async () => {
        try {
            const response = await axiosInstance.get("adbannerweb/getall");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error) || "Something went wrong";
            throw error;
        }
    }

)



const adBannerwebSlice = createSlice({
    name: "adbannerweb",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createAdBannerweb.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(createAdBannerweb.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(createAdBannerweb.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteAdBannerweb.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteAdBannerweb.fulfilled, (state) => {
            state.deleting = false;
            state.deleted = !state.deleted;
        })
        builder.addCase(deleteAdBannerweb.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(getAllAdBannersweb.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllAdBannersweb.fulfilled, (state, action) => {
            state.loading = false;
            state.adbannersweb = action.payload;
        })
        builder.addCase(getAllAdBannersweb.rejected, (state) => {
            state.loading = false;
        })
    }
})


export default adBannerwebSlice.reducer;


