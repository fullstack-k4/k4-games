import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";

const initialState = {
    loading: false,
    notificationloading: false,
    games: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalGames: 0,
    },
    uploading: null,
    uploaded: null,
    deleted: false,
    deleting: false,
    game: null,
}



export const getAllGames = createAsyncThunk(
    'getAllGames',
    async ({ page, limit, query }) => {
        try {
            const url = new URL(`${BASE_URL}/knifethrowgame/getall`)
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);

            url.searchParams.set("sortBy", "newest")

            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }

    }
)



export const deleteGame = createAsyncThunk(
    'deleteGame',
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.delete(`/knifethrowgame/delete/${gameId}`);
            toast.success("Game Deleted Succesfully");
            return gameId;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)


export const uploadGame = createAsyncThunk("uploadGame", async (data) => {
    try {
        const response = await axiosInstance.post("/knifethrowgame/upload", data);
        toast.success("Game Uploaded Succesfully");
        return response.data.data;
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.error);
        throw error;
    }

})

export const getById = createAsyncThunk(
    "getById",
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.get(`/knifethrowgame/get/${gameId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const update = createAsyncThunk(
    "update",
    async ({ gameId, data }) => {
        try {
            const response = await axiosInstance.patch(`/knifethrowgame/update/${gameId}`, data);
            toast.success("Game Edited Successfully");
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }

    }
)

export const sendNotificationToAllUsers = createAsyncThunk(
    'sendNotificationToAllUsers',
    async ({ data }) => {
        try {
            const response = await axiosInstance.post(`/knifethrowgame/sendnotification/all`, data);
            toast.success("Notification Sent Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const sendAdvertisementNotificationToAllUsers = createAsyncThunk(
    'sendAdvertisementNotificationToAllUsers',
    async ({ data }) => {
        try {
            const response = await axiosInstance.post(`/knifethrowgame//sendadvertisementnotfication/all`, data);
            toast.success("Notification Sent Successfully")
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const sendGameNotificationtoAllUsers = createAsyncThunk(
    'sendGameNotificationtoAllUsers',
    async ({ data }) => {
        try {
            const response = await axiosInstance.post(`/knifethrowgame/sendgamenotification/all`, data);
            toast.success("Notification Sent Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const sendNewGamesNotificationToAllUsers = createAsyncThunk(
    'sendNewGamesNotificationToAllUsers',
    async ({ data }) => {
        try {
            const response = await axiosInstance.post(`/knifethrowgame/sendnewgamesnotification/all`, data);
            toast.success("Notification Sent Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const sendSavedGamesNotificationToAllUsers = createAsyncThunk(
    'sendSavedGamesNotificationToAllUsers',
    async ({ data }) => {
        try {
            const response = await axiosInstance.post(`/knifethrowgame/sendsavedgamesnotification/all`, data);
            toast.success("Notification Sent Successfully")
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)





const gameSlice = createSlice({
    name: "knifethrowgames",
    initialState,
    reducers: {
        makeGamesNull: (state) => {
            state.games.docs = [];
        },
        makeGameNull: (state) => {
            state.game = null;
        },
        updateUploadState: (state) => {
            state.uploading = false;
            state.uploaded = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(uploadGame.pending, (state) => {
            state.uploading = true;
            state.loading = true;
        });
        builder.addCase(uploadGame.fulfilled, (state, action) => {
            state.uploading = false;
            state.uploaded = true;
            state.loading = false;
        })
        builder.addCase(uploadGame.rejected, (state) => {
            state.uploading = false;
            state.loading = false;
        })
        builder.addCase(getAllGames.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllGames.fulfilled, (state, action) => {
            state.loading = false;
            state.games.docs = [...state.games.docs, ...action.payload.docs];
            state.games.hasNextPage = action.payload.hasNextPage;
            state.games.totalPages = action.payload.totalPages;
            state.games.totalGames = action.payload.totalDocs;
        })
        builder.addCase(getAllGames.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteGame.pending, (state, action) => {
            state.deleting = true;
        })

        builder.addCase(deleteGame.fulfilled, (state, action) => {
            state.games.docs = state.games.docs.filter((game) => game?._id !== action.payload.gameId);
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deleteGame.rejected, (state) => {
            state.deleted = false;
            state.deleting = true;
        })
        builder.addCase(sendNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendNotificationToAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendGameNotificationtoAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendGameNotificationtoAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendGameNotificationtoAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendAdvertisementNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendAdvertisementNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendAdvertisementNotificationToAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendNewGamesNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendNewGamesNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendNewGamesNotificationToAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendSavedGamesNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendSavedGamesNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendSavedGamesNotificationToAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(getById.pending,(state)=>{
            state.loading = true;
        })
        builder.addCase(getById.fulfilled,(state,action)=>{
            state.loading = false;
            state.game = action.payload;
        })
        builder.addCase(getById.rejected,(state)=>{
            state.loading = false;
        })
        builder.addCase(update.pending,(state)=>{
            state.loading = true;
        })
        builder.addCase(update.fulfilled,(state)=>{
            state.loading = false;
        })
        builder.addCase(update.rejected,(state)=>{
            state.loading = false;
        })
    }
})

export const { makeGamesNull, makeGameNull, updateUploadState} = gameSlice.actions;


export default gameSlice.reducer;