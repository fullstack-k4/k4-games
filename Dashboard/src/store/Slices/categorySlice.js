import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import {toast} from "sonner";
import { BASE_URL } from "@/constant";



const initialState={
    loading:false,
    categories:[],
    adding:false,
    deleted:false,
    deleting:false,
    category:null,
    editing:false,
}



export const getAllCategories=createAsyncThunk(
    'getAllCategories',
    async()=>{
        try {
            const response=await axiosInstance.get("category/getall");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)




export const createCategory=createAsyncThunk(
    'createCategory',
    async(data)=>{

        const formData = new FormData();

        if(data.image){
            formData.append('image',data.image[0]);
        }
        else{
            formData.append('imageUrl',data.imageUrl);
        }
        formData.append('name',data.name);
        formData.append('slug',data.slug);
        try {
            const response=await axiosInstance.post("category/create",formData);
            toast.success("Category Created Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const deleteCategory=createAsyncThunk(
    'deleteCategory',
    async({id})=>{
        try {
            const response=await axiosInstance.delete(`category/delete/${id}`);
            toast.success("Category Deleted Successfully")
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
    
)

export const getCategoryById=createAsyncThunk(
    "getCategoryById",
    async({id})=>{
        try {
            const response=await axiosInstance.get(`category/get/${id}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const editCategory=createAsyncThunk(
    'editCategory',
    async({categoryId,data})=>{
        try {
            const formData=new FormData();
            if(data.image){
                formData.append('image',data.image[0]);
            }
            else{
                formData.append('imageUrl',data.imageUrl);
            }

            formData.append("slug",data.slug);
            formData.append("imageSource",data.imageSource);

            const url=new URL(`${BASE_URL}/category/edit/${categoryId}`);
            const response=await axiosInstance.patch(url,formData);
            toast.success("Category Updated Successfully");
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)



const categorySlice=createSlice({
    name:"category",
    initialState,
    reducers:{
        makeCategoryNull: (state) => {
            state.category = null
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(getAllCategories.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(getAllCategories.fulfilled,(state,action)=>{
            state.loading=false;
            state.categories=action.payload;
        })
        builder.addCase(getAllCategories.rejected,(state)=>{
            state.loading=false;
        })
        builder.addCase(createCategory.pending,(state)=>{
            state.adding=true;
        })
        builder.addCase(createCategory.fulfilled,(state,action)=>{
            state.adding=false;
            state.categories.push(action.payload);
        })
        builder.addCase(createCategory.rejected,(state)=>{
            state.adding=false;
        })
        builder.addCase(deleteCategory.pending,(state)=>{
            state.deleting=true;
        })
        builder.addCase(deleteCategory.fulfilled,(state,action)=>{
            state.categories=state.categories.filter(category=>category._id!==action.payload._id);
            state.deleted=!state.deleted;
            state.deleting=false;
        })
        builder.addCase(deleteCategory.rejected,(state)=>{
            state.deleting=false;
            state.deleted=false;
        })
        builder.addCase(editCategory.pending,(state)=>{
            state.editing=true;
        })
        builder.addCase(editCategory.fulfilled,(state)=>{
            state.editing=false;
        })
        builder.addCase(editCategory.rejected,(state)=>{
            state.editing=false;
        })
        builder.addCase(getCategoryById.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(getCategoryById.fulfilled,(state,action)=>{
            state.loading=false;
            state.category=action.payload;
        })
        builder.addCase(getCategoryById.rejected,(state)=>{
            state.loading=false;
        })
    }
})

export const {makeCategoryNull}=categorySlice.actions;


export default categorySlice.reducer;