import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";



const initialState = {
    loading: false,
    games: {
        docs: [],
        hasNextPage: false,
        totalPages: 0,
        totalGames: 0
    },
    deleted: false,
    deleting: false,
    game: null,
}


export const getall = createAsyncThunk(
    "getall",
    async ({ page, limit, query }) => {
        try {
            const url = new URL(`${BASE_URL}/offlinegamesapp/getall`)
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
            await axiosInstance.delete(`/offlinegamesapp/delete/${gameId}`);
            toast.success("Game Delted Successfully");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const uploadGame = createAsyncThunk(
    'uploadGame',
    async (data) => {
        try {
            const response = await axiosInstance.post("/offlinegamesapp/upload", data);
            toast.success("Game Uploaded Successfully");
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const getById = createAsyncThunk(
    "getById",
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.get(`/offlinegamesapp/get/${gameId}`);
            return response.data.data;
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const update = createAsyncThunk(
    'update',
    async ({ gameId, data }) => {
        try {
            const response = await axiosInstance.patch(`/offlinegamesapp/update/${gameId}`, data);
            toast.success("Game Edited Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

const offlinegamesappgamesSlice = createSlice({
    name: "offlinegamesappgame",
    initialState,
    reducers: {
        makeGamesNull: (state) => {
            state.games.docs = [];
        },
        makeGameNull: (state) => {
            state.game = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(uploadGame.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(uploadGame.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(uploadGame.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getall.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getall.fulfilled, (state, action) => {
            state.loading = false;
            state.games.docs = [...state.games.docs, ...action.payload.docs];
            state.games.hasNextPage = action.payload.hasNextPage;
            state.games.totalPages = action.payload.totalPages;
            state.games.totalGames = action.payload.totalDocs;
        })
        builder.addCase(getall.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getById.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getById.fulfilled, (state, action) => {
            state.loading = false;
            state.game = action.payload;
        })
        builder.addCase(getById.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(deleteGame.pending, (state) => {
            state.deleting = true;
        })
        builder.addCase(deleteGame.fulfilled, (state) => {
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deleteGame.rejected, (state) => {
            state.deleted = false;
            state.deleting = false;
        })
        builder.addCase(update.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(update.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(update.rejected, (state) => {
            state.loading = false;
        })
    }
})


export const { makeGamesNull, makeGameNull } = offlinegamesappgamesSlice.actions;


export default offlinegamesappgamesSlice.reducer;

