import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    categories: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalCategories: 0,
    },
    categoriesList: null,
    deleted: false,
    deleting: false,
}


export const createCategory = createAsyncThunk(
    'createCategory',
    async (data) => {
        const formData = new FormData();

        if (data.image) {
            formData.append('image', data.image[0]);
        }

        formData.append('name', data.name);
        formData.append('slug', data.slug);


        try {
            const response = await axiosInstance.post("offlinegamescategory/create", formData);
            toast.success("Category Created Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const getAllCategories = createAsyncThunk(
    'getAllCategories',
    async ({ page, limit, query }) => {
        try {
            const url = new URL(`${BASE_URL}/offlinegamescategory/getall`);
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);

            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const getAllCategoriesList = createAsyncThunk(
    'getAllCategoriesList',
    async()=>{
        try {
            const response = await axiosInstance.get(`offlinegamescategory/getalllist`)
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const deleteCategory = createAsyncThunk(
    'deleteCategory',
    async ({ id }) => {
        try {
            const response = await axiosInstance.delete(`offlinegamescategory/delete/${id}`);
            toast.success("Category Deleted Successfully")
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



const offlinegamesappcategorySlice = createSlice({
    name: "offlinegamesappcategory",
    initialState,
    reducers: {
        makeCategoriesNull: (state) => {
            state.categories.docs = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createCategory.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(createCategory.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(createCategory.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteCategory.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteCategory.fulfilled, (state) => {
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deleteCategory.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(getAllCategories.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.categories.docs = [...state.categories.docs, ...action.payload.docs];
            state.categories.hasNextPage = action.payload.hasNextPage;
            state.categories.totalPages = action.payload.totalPages;
            state.categories.totalCategories = action.payload.totalDocs;
        })
        builder.addCase(getAllCategories.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getAllCategoriesList.fulfilled,(state,action)=>{
            state.categoriesList=action.payload;
        })
    }
})



export const { makeCategoriesNull } = offlinegamesappcategorySlice.actions;


export default offlinegamesappcategorySlice.reducer;