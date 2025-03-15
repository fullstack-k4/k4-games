import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    reports: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalReports: 0
    },
    deleted: false,
    deleting: false
}

export const getAllReports=createAsyncThunk(
    'getAllReports',
    async({type,page,limit})=>{
        try {
            const url = new URL(`${BASE_URL}/report/getall`)
            if(type) url.searchParams.set("type",type)
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

export const deleteReport=createAsyncThunk(
    'deleteReport',
    async({id})=>{
        try {
            const response=await axiosInstance.delete(`report/delete/${id}`);
            toast.success("Report Deleted Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {
        makeReportsNull: (state) => {
            state.reports.docs = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllReports.pending,(state)=>{
            state.loading=true;
        })
        builder.addCase(getAllReports.fulfilled,(state,action)=>{
            state.loading=false;
            state.reports.docs=[...state.reports.docs,...action.payload.docs];
            state.reports.hasNextPage = action.payload.hasNextPage;
            state.reports.totalPages = action.payload.totalPages;
            state.reports.totalReports = action.payload.totalDocs;
            
        })
        builder.addCase(getAllReports.rejected,(state)=>{
            state.loading=false;
        })
        builder.addCase(deleteReport.pending,(state)=>{
            state.deleting=true;
        })
        builder.addCase(deleteReport.fulfilled,(state,action)=>{
            state.reports.docs=state.reports.docs.filter((report)=>report.id!==action.payload._id);
            state.deleting=false;
            state.deleted=!state.deleted;
        })
        builder.addCase(deleteReport.rejected,(state)=>{
            state.deleting=false;
            state.deleted=false;
        })

    }
})


export const {makeReportsNull}=reportSlice.actions



export default reportSlice.reducer;

