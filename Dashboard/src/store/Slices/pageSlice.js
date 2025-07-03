import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";


const initialState = {
    loading: false,
    pages: [],
    adding: false,
    deleted: false,
    deleting: false,
    page: null,
    editing: false,
}


export const getAllPages = createAsyncThunk(
    'getAllPages',
    async () => {
        try {
            const response = await axiosInstance.get("pages/getall");
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const createPage = createAsyncThunk(
    'createPage',
    async (data) => {
        try {
            const response = await axiosInstance.post("pages/create", data);
            toast.success("Page Created Successfully")
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const editPage = createAsyncThunk(
    'editPage',
    async ({ data, id }) => {
        try {
            const response = await axiosInstance.patch(`pages/edit/${id}`, data);
            toast.success("Page Updated Successfully");
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)

export const getPageBySlug = createAsyncThunk(
    'getPageBySlug',
    async (slug) => {
        try {
            const response = await axiosInstance.get(`pages/getBySlug?slug=${slug}`);
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const deletePage = createAsyncThunk(
    'deletePage',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`pages/delete/${id}`);
            toast.success("Page Deleted Successfully");
            return response.data.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


const pageSlice = createSlice({
    name: "page",
    initialState,
    reducers: {
        makePageNull: (state) => {
            state.page = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAllPages.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllPages.fulfilled, (state, action) => {
            state.loading = false;
            state.pages = action.payload;
        })
        builder.addCase(getAllPages.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(createPage.pending, (state) => {
            state.adding = true;
        })
        builder.addCase(createPage.fulfilled, (state, action) => {
            state.adding = false;
            state.pages.push(action.payload);
        })
        builder.addCase(createPage.rejected, (state) => {
            state.adding = false;
        })
        builder.addCase(deletePage.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deletePage.fulfilled, (state, action) => {
            state.pages = state.pages.filter(page => page._id !== action.payload._id);
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deletePage.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(editPage.pending, (state) => {
            state.editing = true;
        })
        builder.addCase(editPage.fulfilled, (state) => {
            state.editing = false;
        })
        builder.addCase(editPage.rejected, (state) => {
            state.editing = false;
        })
        builder.addCase(getPageBySlug.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getPageBySlug.fulfilled, (state, action) => {
            state.loading = false;
            state.page = action.payload;
        })
        builder.addCase(getPageBySlug.rejected, (state) => {
            state.loading = false;
        })
    }
})


export const { makePageNull } = pageSlice.actions;


export default pageSlice.reducer;