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
        totalGames: 0,
    },
    game: null,
    uploading: null,
    uploaded: null,
    deleted: false,
    deleting: false,
    editing: false,
    toggled: false,
    categories: null,
}



export const getAllGames = createAsyncThunk(
    'getAllGames',
    async ({ page, limit, query, category, userId, userRole, filterBy, status }) => {
        try {
            const url = new URL(`${BASE_URL}/games/getalldashboard`)
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);
            if (category) url.searchParams.set("category", category);
            if (userId) url.searchParams.set("userId", userId);
            if (userRole) url.searchParams.set("userRole", userRole);
            if (filterBy) url.searchParams.set("filterBy", filterBy);
            if (status) url.searchParams.set("status", status);

            // manually adding sortBy equals to newest 
            url.searchParams.set("sortBy", "newest");

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
            const url = new URL(`${BASE_URL}/games/get`)

            if (gameId) url.searchParams.set("_id", gameId);
            const response = await axiosInstance.get(url);
            return response.data.data;

        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const getGameCategories = createAsyncThunk("getGameCategories", async () => {
    try {
        const response = await axiosInstance.get("games/getcategories");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;

    }
})

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
            const trimmedgameName = data.gameName?.trim();
            const trimmedgameDescription = data.description?.trim();
            formData.append("gameName", trimmedgameName);
            formData.append("description", trimmedgameDescription);
            formData.append("splashColor", data.splashColor);
            formData.append("isrotate", data.isrotate);
            formData.append("slug", data.slug);
            formData.append("primaryCategory", data.primaryCategory);
            formData.append("instruction", data.instruction);
            formData.append("gamePlayVideo", data.gamePlayVideo);
            formData.append("isDesktop", data.isDesktop);
            formData.append("isAppOnly", data.isAppOnly);
            formData.append("isPremium", data.isPremium);
            formData.append("isHiddenWeb", data.isHiddenWeb);
            formData.append("topTenCount", data.topTenCount);
            formData.append("likesCount", data.likesCount);
            formData.append("dislikesCount", data.dislikesCount);
            formData.append("status", data.status);
            formData.append("notify", data.notify);

            if(data.scheduledAt){
                formData.append("scheduledAt",data.scheduledAt);
            }

            if (data.image) {
                formData.append("image", data.image[0]);
            }
            if (data.gameZip) {
                formData.append("gameZip", data.gameZip[0]);
            }
            if (data.imageUrl) {
                formData.append("imageUrl", data.imageUrl);
            }
            if (data.gameUrl) {
                formData.append("gameUrl", data.gameUrl);
            }
            if (data.video) {
                formData.append("video", data.video[0]);
            }
            if (data.videoUrl) {
                formData.append("backgroundVideoUrl", data.videoUrl);
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


export const uploadGame = createAsyncThunk("uploadGame", async (data) => {
    const formData = new FormData();
    const trimmedgameName = data.gameName.trim();
    const trimmedgameDescription = data.description.trim();
    formData.append("gameName", trimmedgameName);
    formData.append("description", trimmedgameDescription);


    if (data.image) {
        formData.append("image", data.image[0]);
    }
    else {
        const trimmedgameImageUrl = data.imageUrl?.trim();
        formData.append("imageUrl", trimmedgameImageUrl)
    }

    if (data.gameZip) {
        formData.append("gameZip", data.gameZip[0]);
    }
    else {
        formData.append("gameUrl", data.gameUrl)
    }
    if (data.video) {
        formData.append("video", data.video[0]);
    }
    else {
        formData.append("backgroundVideoUrl", data.videoUrl)
    }

    data.category.forEach((cat) => {
        formData.append("category[]", cat);
    });
    formData.append("splashColor", data.splashColor);
    formData.append("downloadable", data.downloadable);
    formData.append("isrotate", data.isrotate);
    formData.append("slug", data.slug);
    formData.append("primaryCategory", data.primaryCategory);
    formData.append("instruction", data.instruction);
    formData.append("gamePlayVideo", data.gamePlayVideo);
    formData.append("isDesktop", data.isDesktop);
    formData.append("isAppOnly", data.isAppOnly);
    formData.append("isPremium", data.isPremium);
    formData.append("isHiddenWeb", data.isHiddenWeb);
    formData.append("topTenCount", data.topTenCount);
    formData.append("likesCount", data.likesCount);
    formData.append("dislikesCount", data.dislikesCount);
    formData.append("status", data.status);
    formData.append("notify", data.notify);

    if (data.scheduledAt) {
        formData.append("scheduledAt", data.scheduledAt);
    }


    try {
        const response = await axiosInstance.post("games/upload", formData);
        toast.success("Game Uploaded Succesfully");
        return response.data.data;
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.error);
        throw error;
    }

})


export const allowDownload = createAsyncThunk("allowDownload",
    async ({ data, gameId }) => {
        try {
            const formData = new FormData();
            if (data.gameZip) {
                formData.append("gameZip", data.gameZip[0]);
            }
            const response = await axiosInstance.patch(`games/allowdownload/${gameId}`, formData);
            toast.success("Download Status Toggled Successfully");
            return response.data.data;

        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    })

export const denyDownload = createAsyncThunk("denyDownload",
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.patch(`games/denydownload/${gameId}`);
            toast.success("Download Status Toggled Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const allowFeatured = createAsyncThunk("allowFeatured",
    async ({ data, gameId }) => {
        try {
            const formData = new FormData();
            if (data.image) {
                formData.append("imageFile", data.image[0]);
            }
            if (data.video) {
                formData.append("videoFile", data.video[0]);
            }
            if (data.imageUrl) {
                formData.append("featuredImageUrl", data.imageUrl);
            }
            if (data.videoUrl) {
                formData.append("featuredVideoUrl", data.videoUrl);
            }
            const response = await axiosInstance.patch(`games/allowfeatured/${gameId}`, formData);
            toast.success("Featured Status Toggled Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const allowRecommended = createAsyncThunk("allowRecommended",
    async ({ data, gameId }) => {
        try {
            const formData = new FormData();
            if (data.image) {
                formData.append("image", data.image[0]);
            }
            if (data.imageUrl) {
                formData.append("recommendedImageUrl", data.imageUrl);
            }
            const response = await axiosInstance.patch(`games/allowrecommended/${gameId}`, formData);
            toast.success("Recommended Status Toggled Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const denyFeatured = createAsyncThunk(
    "denyFeatured",
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.patch(`games/denyFeatured/${gameId}`);
            toast.success("Featured Status Toggled Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

export const denyRecommended = createAsyncThunk(
    "denyRecommended",
    async ({ gameId }) => {
        try {
            const response = await axiosInstance.patch(`games/denyrecommended/${gameId}`);
            toast.success("Recommended Status Toggled Successfully");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)

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
        builder.addCase(deleteGame.rejected, (state) => {
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
        builder.addCase(getGameCategories.fulfilled, (state, action) => {
            state.categories = action.payload;
        })
        builder.addCase(allowDownload.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(allowDownload.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(allowDownload.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(denyDownload.pending, (state) => {
            state.toggled = false;
        })
        builder.addCase(denyDownload.fulfilled, (state) => {
            state.toggled = true;
        })
        builder.addCase(denyDownload.rejected, (state) => {
            state.toggled = false;
        })
        builder.addCase(allowFeatured.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(allowFeatured.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(allowFeatured.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(denyFeatured.pending, (state) => {
            state.toggled = false;
        })
        builder.addCase(denyFeatured.fulfilled, (state) => {
            state.toggled = true;
        })
        builder.addCase(denyFeatured.rejected, (state) => {
            state.toggled = false;
        })
        builder.addCase(allowRecommended.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(allowRecommended.fulfilled, (state) => {
            state.loading = false;
        })
        builder.addCase(allowRecommended.rejected, (state) => {
            state.loading = false;
        })
        builder.addCase(denyRecommended.pending, (state) => {
            state.toggled = false;
        })
        builder.addCase(denyRecommended.fulfilled, (state) => {
            state.toggled = true;
        })
        builder.addCase(denyRecommended.rejected, (state) => {
            state.toggled = false;
        })
    }
})

export const { makeGamesNull, makeGameNull, updateUploadState } = gameSlice.actions;


export default gameSlice.reducer;