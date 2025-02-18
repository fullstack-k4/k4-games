import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helpers/axiosinstance";
import { toast } from "sonner";
import { BASE_URL } from "@/constant";

const initialState = {
    loading: false,
    games: {
        docs: [],
        hasNextPage: false,
        totalPages: 0
    },
    game: null,
    totalGames: null,
    DownloadAllowedGames: null,
    NumberofUploadedGamesByLink: null,
    NumberOfSelfUploadedGames: null,
    uploading: null,
    uploaded: null,
    deleted: false,
    deleting: false,
    editing: false,
    categories:null,
    toggled:false,
}



export const getAllGames = createAsyncThunk(
    'getAllGames',
    async ({ page, limit, query,category }) => {
        try {
            const url = new URL(`${BASE_URL}/games/getall`)
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);
            if(category) url.searchParams.set("category", category);

            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }

    }
)

export const getGameById = createAsyncThunk(
    'getGameById',
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.get(`/games/get/${gameId}`);
            return response.data.data;

        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const deleteGame = createAsyncThunk(
    'deleteGame',
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.delete(`/games/delete/${gameId}`);
            toast.success("Game Deleted Succesfully");
            return gameId;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }

)

export const editGame = createAsyncThunk(
    'editGame',
    async ({ gameId, data }) => {
        try {

            const formData = new FormData();
            const trimmedgameName=data.gameName?.trim();
            const trimmedgameDescription=data.description?.trim();
            formData.append("gameName", trimmedgameName);
            formData.append("description", trimmedgameDescription);
            formData.append("splashColor", data.splashColor);
            formData.append("isrotate", data.isrotate);

            if (data.image) {  
                formData.append("image", data.image[0]);
            }
            if(data.gameZip){
                formData.append("gameZip", data.gameZip[0]);
            }
            if(data.imageUrl){
                formData.append("imageUrl",data.imageUrl);
            }
            if(data.gameUrl){
                formData.append("gameUrl",data.gameUrl);
            }
            data.category.forEach((cat) => {
                formData.append("category[]", cat);
            });
            const response = await axiosInstance.patch(`/games/edit/${gameId}`, formData);
            toast.success("Game Edited Succesfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)
export const getTotalNumberOfGames = createAsyncThunk(
    "getTotalNumberOfGames",
    async () => {
        try {
            const response = await axiosInstance.get("/games/getNumberOfTotalGames");
            return response.data.data

        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)
export const getTotalNumberOfAllowedDownloadGames = createAsyncThunk(
    "getTotalNumberOfAllowedDownloadGames",
    async () => {
        try {
            const response = await axiosInstance.get("/games/getNumberOfAllowedDownloadGames")
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)
export const uploadGame = createAsyncThunk("uploadGame", async (data) => {
    const formData = new FormData();
    const trimmedgameName=data.gameName.trim();
    const trimmedgameDescription=data.description.trim();
    formData.append("gameName", trimmedgameName);
    formData.append("description", trimmedgameDescription);


    if (data.image) {
        formData.append("image", data.image[0]);
    }
    else {
        const trimmedgameImageUrl=data.imageUrl?.trim();
        formData.append("imageUrl", trimmedgameImageUrl)
    }

    if (data.gameZip) {
        formData.append("gameZip", data.gameZip[0]);
    }
    else {
        formData.append("gameUrl", data.gameUrl)
    }

    data.category.forEach((cat) => {
        formData.append("category[]", cat);
    });
    formData.append("splashColor", data.splashColor);
    formData.append("isdownload", data.isdownload);
    formData.append("isrotate", data.isrotate);

    try {
        const response = await axiosInstance.post("games/upload", formData);
        toast.success("Game Uploaded Succesfully");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }

})

export const getNumberOfSelfUploadedGames = createAsyncThunk("getNumberOfSelfUploadedGames", async () => {
    try {
        const response = await axiosInstance.get("games/getNumberOfSelfUploadedGames");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})

export const getNumberofUploadedGamesByLink = createAsyncThunk("getNumberofUploadedGamesByLink", async () => {
    try {
        const response = await axiosInstance.get("games/getNumberofUploadedGamesByLink");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})


export const getGameCategories=createAsyncThunk("getGameCategories",async()=>{
    try {
        const response=await axiosInstance.get("games/getcategories");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
        
    }
})

export const toggleDownloadStatus=createAsyncThunk("toggleDownloadStatus",async({gameId})=>{
    try {
        const response=await axiosInstance.patch(`games/toggledownloadStatus/${gameId}`);
        toast.success("Download Status Toggled Successfully");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})





const gameSlice = createSlice({
    name: "game",
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
        builder.addCase(getTotalNumberOfGames.fulfilled, (state, action) => {
            state.totalGames = action.payload
        })
        builder.addCase(getTotalNumberOfAllowedDownloadGames.fulfilled, (state, action) => {
            state.DownloadAllowedGames = action.payload;
        })
        builder.addCase(uploadGame.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(uploadGame.fulfilled, (state, action) => {
            state.uploading = false;
            state.uploaded = true;
        })
        builder.addCase(getAllGames.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getAllGames.fulfilled, (state, action) => {
            state.loading = false;
            state.games.docs = [...state.games.docs, ...action.payload.docs];
            state.games.hasNextPage = action.payload.hasNextPage;
            state.games.totalPages = action.payload.totalPages;
        })
        builder.addCase(getAllGames.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(getGameById.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getGameById.fulfilled, (state, action) => {
            state.loading = false;
            state.game = action.payload;
        })
        builder.addCase(getGameById.rejected, (state) => {
            state.loading = false;
            state.game = null;
        })
        builder.addCase(deleteGame.pending, (state, action) => {
            state.deleting = true;
        })

        builder.addCase(deleteGame.fulfilled, (state, action) => {
            state.games.docs = state.games.docs.filter((game) => game?._id !== action.payload.gameId);
            state.deleted = !state.deleted;
            state.deleting = false;
        })
        builder.addCase(deleteGame.rejected, (state, action) => {
            state.deleted = false;
            state.deleting = true;
        })
        builder.addCase(editGame.pending, (state) => {
            state.editing = true;
        })
        builder.addCase(editGame.fulfilled, (state, action) => {
            state.editing = false;
            const index = state.games.docs.findIndex((game) => game._id === action.payload._id);
            if (index !== -1) {
                state.games.docs[index] = { ...action.payload };
            }
        })
        builder.addCase(editGame.rejected, (state) => {
            state.editing = false;
        })
        builder.addCase(getNumberOfSelfUploadedGames.fulfilled, (state, action) => {
            state.NumberOfSelfUploadedGames = action.payload;
        })
        builder.addCase(getNumberofUploadedGamesByLink.fulfilled, (state, action) => {
            state.NumberofUploadedGamesByLink = action.payload;
        })
        builder.addCase(getGameCategories.fulfilled,(state,action)=>{
            state.categories=action.payload;
        })
        builder.addCase(toggleDownloadStatus.pending,(state)=>{
            state.toggled=false;
        })
        builder.addCase(toggleDownloadStatus.fulfilled,(state)=>{
            state.toggled=true;
        })
        builder.addCase(toggleDownloadStatus.rejected,(state)=>{
            state.toggled=false;

        })

    }
})

export const { makeGamesNull, makeGameNull, updateUploadState } = gameSlice.actions;


export default gameSlice.reducer;