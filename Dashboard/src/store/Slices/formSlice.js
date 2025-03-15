import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    forms: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalForms: 0
    },
    deleted: false,
    deleting: false
}




export const getAllForms=createAsyncThunk(
    'getAllForms',
    async({page,limit})=>{
        try {
            const url = new URL(`${BASE_URL}/form/getall`)
            if(page) url.searchParams.set("page",page);
            if(limit) url.searchParams.set("limit",limit);
                const response=await axiosInstance.get(url);
                return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Something went wrong");
            throw error;
        }
    }
)

export const deleteForm=createAsyncThunk(
    'deleteForm',
    async({id})=>{
        try {
            const response=await axiosInstance.delete(`form/delete/${id}`);
            toast.success("Form Deleted Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


const formSlice = createSlice({
    name: "form",
    initialState,
    reducers: {
        makeFormsNull: (state) => {
            state.forms.docs = [];
        },
    },
    extraReducers: (builder) => {
    
        builder.addCase(getAllForms.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(getAllForms.fulfilled,(state,action)=>{
            state.loading=false;
            state.forms.docs=[...state.forms.docs,...action.payload.docs];
            state.forms.hasNextPage = action.payload.hasNextPage;
            state.forms.totalPages = action.payload.totalPages;
            state.forms.totalForms = action.payload.totalDocs;
            
        })
        builder.addCase(getAllForms.rejected,(state)=>{
            state.loading=false;
        })
        builder.addCase(deleteForm.pending,(state)=>{
            state.deleting=true;
        })
        builder.addCase(deleteForm.fulfilled,(state,action)=>{
            state.forms.docs=state.forms.docs.filter((form)=>form.id!==action.payload._id);
            state.deleting=false;
            state.deleted=!state.deleted;
        })
        builder.addCase(deleteForm.rejected,(state)=>{
            state.deleting=false;
            state.deleted=false;
        })

    }
})


export const {makeFormsNull}=formSlice.actions





export default formSlice.reducer;

