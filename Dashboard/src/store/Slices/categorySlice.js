import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import {toast} from "sonner";



const initialState={
    loading:false,
    categories:[],
    adding:false,
    deleted:false,
    deleting:false,
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



const categorySlice=createSlice({
    name:"category",
    initialState,
    reducers:{},
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
    }
})


export default categorySlice.reducer;