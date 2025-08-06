import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    categoriespopup: [],
    categoriesDashboard: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalCategories: 0
    },
    adding: false,
    deleted: false,
    deleting: false,
    category: null,
    editing: false,
}





export const getAllCategoriesDashboard = createAsyncThunk(
    'getAllCategoriesDashboard',
    async ({ page, limit, query, filterBy }) => {
        try {
            const url = new URL(`${BASE_URL}/category/getalldashboard`);
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);
            if (filterBy) url.searchParams.set("filterBy", filterBy);


            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const getAllCategoriesDashboardPopup = createAsyncThunk(
    'getAllCategoriesDashboardPopup',
    async ({ query, alphabetquery }) => {
        try {
            const url = new URL(`${BASE_URL}/category/getalldashboardpopup`);
            if (query) url.searchParams.set("query", query);
            if (alphabetquery) url.searchParams.set("alphabetquery", alphabetquery);
            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



export const createCategory = createAsyncThunk(
    'createCategory',
    async (data) => {

        const formData = new FormData();

        if (data.image) {
            formData.append('image', data.image[0]);
        }
        else {
            formData.append('imageUrl', data.imageUrl);
        }

        if (data.icon) {
            formData.append('icon', data.icon[0]);
        }
        else {
            formData.append('iconUrl', data.iconUrl);
        }

        if (data.description) {
            formData.append('description', data.description);
        }



        formData.append('name', data.name);
        formData.append('slug', data.slug);
        formData.append('isSidebar', data.isSidebar);
        formData.append('gradientColor1', data.gradientColor1);
        formData.append('gradientColor2', data.gradientColor2);
        formData.append('order', data.order);


        try {
            const response = await axiosInstance.post("category/create", formData);
            toast.success("Category Created Successfully");
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
            const response = await axiosInstance.delete(`category/delete/${id}`);
            toast.success("Category Deleted Successfully")
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)

export const getCategoryById = createAsyncThunk(
    "getCategoryById",
    async ({ id }) => {
        try {
            const response = await axiosInstance.get(`category/get/${id}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const editCategory = createAsyncThunk(
    'editCategory',
    async ({ categoryId, data }) => {
        try {
            const formData = new FormData();
            if (data.image) {
                formData.append('image', data.image[0]);
            }
            else {
                formData.append('imageUrl', data.imageUrl);
            }

            if (data.icon) {
                formData.append('icon', data.icon[0]);
            }
            else {
                formData.append('iconUrl', data.iconUrl);
            }

            if (data.description) {
                formData.append('description', data.description);
            }

            formData.append("slug", data.slug);
            formData.append("imageSource", data.imageSource);
            formData.append("iconSource", data.iconSource);
            formData.append("isSidebar", data.isSidebar);
            formData.append("order", data.order);

            formData.append("gradientColor1", data.gradientColor1);
            formData.append("gradientColor2", data.gradientColor2);

            const url = new URL(`${BASE_URL}/category/edit/${categoryId}`);
            const response = await axiosInstance.patch(url, formData);
            toast.success("Category Updated Successfully");
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        makeCategoryNull: (state) => {
            state.category = null
        },
        makeDashboardCategoriesNull: (state) => {
            state.categoriesDashboard.docs = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createCategory.pending, (state) => {
            state.adding = true;
        })
        builder.addCase(createCategory.fulfilled, (state, action) => {
            state.adding = false;
        })
        builder.addCase(createCategory.rejected, (state) => {
            state.adding = false;
        })
        builder.addCase(deleteCategory.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deleteCategory.rejected, (state) => {
            state.deleting = false;
            state.deleted = false;
        })
        builder.addCase(editCategory.pending, (state) => {
            state.editing = true;
        })
        builder.addCase(editCategory.fulfilled, (state) => {
            state.editing = false;
        })
        builder.addCase(editCategory.rejected, (state) => {
            state.editing = false;
        })
        builder.addCase(getCategoryById.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getCategoryById.fulfilled, (state, action) => {
            state.loading = false;
            state.category = action.payload;
        })
        builder.addCase(getCategoryById.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getAllCategoriesDashboard.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllCategoriesDashboard.fulfilled, (state, action) => {
            state.loading = false;
            state.categoriesDashboard.docs = [...state.categoriesDashboard.docs, ...action.payload.docs];
            state.categoriesDashboard.hasNextPage = action.payload.hasNextPage;
            state.categoriesDashboard.totalPages = action.payload.totalPages;
            state.categoriesDashboard.totalCategories = action.payload.totalDocs;
        })
        builder.addCase(getAllCategoriesDashboard.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getAllCategoriesDashboardPopup.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllCategoriesDashboardPopup.fulfilled, (state, action) => {
            state.loading = false;
            state.categoriespopup = action.payload;
        })
        builder.addCase(getAllCategoriesDashboardPopup.rejected, (state) => {
            state.loading = false;
        })
    }
})

export const { makeCategoryNull, makeDashboardCategoriesNull } = categorySlice.actions;


export default categorySlice.reducer;