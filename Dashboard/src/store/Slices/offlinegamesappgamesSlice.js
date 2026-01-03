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
        totalGames: 0
    },
    deleted: false,
    deleting: false,
    game: null,
    categories: null,
}


export const getall = createAsyncThunk(
    "getall",
    async ({ page, limit, query, category }) => {
        try {
            const url = new URL(`${BASE_URL}/offlinegamesapp/getall`)
            if (page) url.searchParams.set("page", page);
            if (limit) url.searchParams.set("limit", limit);
            if (query) url.searchParams.set("query", query);
            if (category) url.searchParams.set("category", category);

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

export const getGameCategories = createAsyncThunk("getGameCategories", async () => {
    try {
        const response = await axiosInstance.get("offlinegamesapp/getcategories");
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
        const formData = new FormData();
        formData.append("gameName", data.gameName);
        formData.append("description", data.description);
        formData.append("image", data.image[0]);
        formData.append("gameZip", data.gameZip[0]);
        formData.append("splashColor", data.splashColor);
        formData.append("isrotate", data.isrotate);
        formData.append("slug", data.slug);
        formData.append("points", data.points);
        formData.append("gamePublishId", data.gamePublishId);
        data.category.forEach((cat) => {
            formData.append("category[]", cat);
        });

        try {
            const response = await axiosInstance.post("/offlinegamesapp/upload", formData);
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
            const formData = new FormData();
            formData.append("gameName", data.gameName);
            formData.append("description", data.description);
            if (data.image) {
                formData.append("image", data.image[0]);
            }
            if (data.gameZip) {
                formData.append("gameZip", data.gameZip[0]);
            }
            formData.append("splashColor", data.splashColor);
            formData.append("isrotate", data.isrotate);
            formData.append("slug", data.slug);
            formData.append("points", data.points);

            if (data?.gamePublishId) {
                formData.append("gamePublishId", data.gamePublishId);
            }

            data.category.forEach((cat) => {
                formData.append("category[]", cat);
            });
            const response = await axiosInstance.patch(`/offlinegamesapp/update/${gameId}`, formData);
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
            await axiosInstance.post(`/offlinegamesapp/sendnotification/all`, data);
            toast.success("Notification Sent Successfully")
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
            await axiosInstance.post(`/offlinegamesapp/sendadvertisementnotfication/all`, data);
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
            await axiosInstance.post(`/offlinegamesapp/sendgamenotification/all`, data);
            toast.success("Notification Sent Successfully")
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
)


export const sendFavouriteGamesScreenNotificationToAllUsers = createAsyncThunk(
    'sendFavouriteGamesScreenNotificationToAllUsers',
    async ({ data }) => {
        try {
            await axiosInstance.post(`/offlinegamesapp/sendfavouritegamesscreennotification/all`, data);
            toast.success("Notification Sent Successfully")
        } catch (error) {
            console.log(error);
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
        builder.addCase(sendNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendNotificationToAllUsers.rejected, (state) => {
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
        builder.addCase(sendGameNotificationtoAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendGameNotificationtoAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendGameNotificationtoAllUsers.rejected, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendFavouriteGamesScreenNotificationToAllUsers.pending, (state) => {
            state.notificationloading = true;
        })
        builder.addCase(sendFavouriteGamesScreenNotificationToAllUsers.fulfilled, (state) => {
            state.notificationloading = false;
        })
        builder.addCase(sendFavouriteGamesScreenNotificationToAllUsers.rejected, (state) => {
            state.notificationloading = false;
        }),
            builder.addCase(getGameCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
    }
})


export const { makeGamesNull, makeGameNull } = offlinegamesappgamesSlice.actions;


export default offlinegamesappgamesSlice.reducer;

