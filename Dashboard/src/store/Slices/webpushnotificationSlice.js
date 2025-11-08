import axiosInstance from "@/helpers/axiosinstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

const initialState = {
    loading: false
}


export const sendGameWebPushNotification = createAsyncThunk(
    'sendGameWebPushNotification',
    async ({ data }) => {
        try {
            await axiosInstance.post(`/webpushsubscription/sendnotification`, data);
            toast.success("Web Push Notification Sent Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const sendNormalWebPushNotification = createAsyncThunk(
    'sendNormalWebPushNotification',
    async ({ data }) => {
        try {
            await axiosInstance.post(`/webpushsubscription/sendnormalnotification`, data);
            toast.success("Web Push Normal Notification Sent Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const sendAdvertisementWebPushNotification = createAsyncThunk(
    'sendAdvertisementWebPushNotification',
    async ({ data }) => {
        try {
            await axiosInstance.post(`/webpushsubscription/sendadvertisementnotification`, data);
            toast.success("Web Push Advertisement Notification Sent Successfully")
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)


const webpushnotificationSlice = createSlice({
    name: 'webpushnotification',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(sendGameWebPushNotification.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(sendGameWebPushNotification.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(sendGameWebPushNotification.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(sendNormalWebPushNotification.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(sendNormalWebPushNotification.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(sendNormalWebPushNotification.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(sendAdvertisementWebPushNotification.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(sendAdvertisementWebPushNotification.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(sendAdvertisementWebPushNotification.rejected, (state) => {
            state.loading = false;
        })
    }

})



export default webpushnotificationSlice.reducer;



