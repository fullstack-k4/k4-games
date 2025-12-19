import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGames, makeGamesNull, deleteGame } from "@/store/Slices/knifethrowgamesSlice";
import { Trash, Plus, Search, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader } from "./sub-components/";
import { Button } from "@/components/ui/button";
import { sendGameNotificationtoAllUsers } from "@/store/Slices/knifethrowgamesSlice";



const Knifethrowgamespage = () => {
    const dispatch = useDispatch();
    const { games, loading } = useSelector((state) => state.knifethrowgames);
    const totalGames = useSelector((state) => state.knifethrowgames.games?.totalGames);
    const { deleting, deleted } = useSelector((state) => state.knifethrowgames);

    const [open, setOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const [selectedGame, setSelectedGame] = useState(null);
    const [loader, setloader] = useState(true);
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);
    const [selectedGameForNotification, setSelectedGameForNotification] = useState(null);
    const debouncedQuery = useDebounce(searchQuery, 500);
    const gamesPerPage = 10;




    // 🔹 Sync URL with state
    useEffect(() => {
        setSearchParams({ page: currentPage, query: searchQuery });
    }, [currentPage, setSearchParams, searchQuery])




    // 🔹 Fetch games when `currentPage` changes
    useEffect(() => {
        dispatch(makeGamesNull()); // Clear previous page data
        dispatch(getAllGames({
            page: currentPage,
            limit: gamesPerPage,
            query: debouncedQuery,
        })).then(() => {
            setloader(false);
        });
    }, [dispatch, currentPage, deleted, debouncedQuery]);

    // 🔹 Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(makeGamesNull());
        };
    }, [dispatch]);

    // 🔹 Pagination click handler (updates URL & state)
    const paginate = useCallback(
        (pageNumber) => {
            if (pageNumber !== currentPage) {
                setCurrentPage(pageNumber);
                setSearchParams({ page: pageNumber });
            }
        },
        [currentPage, setSearchParams]
    );


    const handleDeleteButttonClick = (game) => {
        setOpen(true);
        setSelectedGame(game);
    }

    const handleDelete = async (game) => {
        if (selectedGame) {
            let response = await dispatch(deleteGame({ gameId: selectedGame?._id }));

            if (response?.type === "deleteGame/fulfilled") {
                setOpen(false);
            }
        }
    };

    // Pagination Logic
    const totalPages = games?.totalPages || 1;
    const pageRange = 2; // Pages before & after the current page

    const getPagination = () => {
        let pages = [];

        // Always include first page
        pages.push(1);

        // Add "..." if there's a gap after first page
        if (currentPage - pageRange > 2) {
            pages.push("...");
        }

        // Generate page numbers dynamically
        for (let i = Math.max(2, currentPage - pageRange); i <= Math.min(totalPages - 1, currentPage + pageRange); i++) {
            pages.push(i);
        }

        // Add "..." before the last page if there's a gap
        if (currentPage + pageRange < totalPages - 1) {
            pages.push("...");
        }

        // Always include last page (only if it's greater than 1)
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };


    // notification handler
    const notifyUsers = async (type) => {
        const game = selectedGameForNotification;
        const maxLength = 100;
        const trimmedDescription =
            game?.description?.length > maxLength
                ? game?.description.slice(0, maxLength) + "..."
                : game?.description || "Tap To View";

        const data = {
            title: game?.gameName || "New Game Check it Out",
            body: trimmedDescription,
            imageUrl: game?.imageUrl,
            mediaData: {
                _id: game?._id,
                gameName: game?.gameName,
                description: game?.description,
                splashColor: game?.splashColor,
                imageUrl: game?.imageUrl,
                gameUrl: game?.gameUrl,
                isrotate: game?.isrotate,
                createdAt: game?.createdAt,
                updatedAt: game?.updatedAt,
                slug: game?.slug,
                __v: game?.__v
            }
        }

        if (type === "all") {
            const response = await dispatch(sendGameNotificationtoAllUsers({ data }));
            if (response.meta.requestStatus === "fulfilled") {
                setNotificationModalOpen(false)
            }
        }
    };






    return (
        loader ? <Loader /> : (
            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900  text-center sm:text-left">
                        🎮 Knife Throw Game Management
                    </h1>
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <Input
                            type="text"
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 w-full rounded-lg border   text-gray-900 "
                        />
                    </div>
                    <Link to="/knifethrow/upload-game">
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                            <Plus size={16} />
                            <span className="font-semibold">New Game</span>
                        </button>
                    </Link>
                </div>

                {/* Notification Buttons */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <Link to="/knifethrowgamesnotification/home">
                        <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold  transition">
                            Home Screen Notification
                        </button>
                    </Link>

                    <Link to="/knifethrowgamesnotification/newgames">
                        <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold shadow  transition">
                            Newest Notification
                        </button>
                    </Link>

                    <Link to="/knifethrowgamesnotification/saved">
                        <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold shadow  transition">
                            Saved Notification
                        </button>
                    </Link>

                    <Link to="/knifethrowgamesnotification/ad">
                        <button className="px-4 py-2 rounded-lg bg-black text-white font-semibold shadow  transition">
                            Ad Notification
                        </button>
                    </Link>
                </div>



                {/* Table */}
                <div className="overflow-x-auto bg-white  rounded-lg shadow-lg">
                    <table className="min-w-full">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="p-4 text-left text-md font-semibold">#</th>
                                <th className="p-4 text-left text-md font-semibold">Game Name</th>
                                <th className="p-4 text-left text-md font-semibold">Description</th>
                                <th className="p-4 text-left text-md font-semibold">Image</th>
                                <th className="p-4 text-left text-md font-semibold">Notify</th>
                                <th className="p-4 text-left text-md font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-4">Loading...</td>
                                </tr>
                            ) : games?.docs?.length > 0 ? (
                                games.docs.map((game, index) => (
                                    <tr key={game._id} className="border-b ">
                                        <td className="p-4 font-medium">
                                            {totalGames - ((currentPage - 1) * gamesPerPage + index)}
                                        </td>

                                        {/* Game Name */}
                                        <td className="p-4 font-bold text-gray-900 ">
                                            {game.gameName}
                                            {game.gameSource === "self" && <div className="text-sm font-normal text-green-500">
                                                ({game.gameUrl?.split("/")[4]})
                                            </div>}
                                            {game.thumbnailSource === "self" && game.gameSource === "link" && <div className="text-sm font-normal text-blue-500">
                                                ({game.imageUrl?.split("/")[4]})
                                            </div>}
                                        </td>

                                        {/* Game Description */}
                                        <td className="p-4 text-gray-700 ">
                                            {game.description.split(" ").slice(0, 4).join(" ")}...
                                        </td>


                                        {/* Game Image */}
                                        <td className="p-4 relative">
                                            {/* Image with animation */}
                                            <motion.img
                                                src={game.imageUrl}
                                                alt={game.gameName}
                                                className="w-16 h-16 rounded-lg shadow-md "
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                            />
                                        </td>



                                        {/* notify */}
                                        <td className="p-4 font-bold text-gray-900">
                                            <Bell
                                                className="ml-4 cursor-pointer"
                                                size={20}
                                                onClick={() => {
                                                    setSelectedGameForNotification(game);
                                                    setNotificationModalOpen(true);
                                                }}
                                            />
                                        </td>



                                        {/* Actions */}
                                        <td className="p-4 space-x-3">
                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-red-500 hover:scale-110 transition" onClick={() => handleDeleteButttonClick(game)}>
                                                        <Trash size={20} />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                                                        <Button variant="destructive" onClick={() => handleDelete(game)} disabled={deleting}>
                                                            {deleting ? "Deleting..." : "Delete"}
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center p-4">No games found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                    {getPagination().map((page, index) =>
                        page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                            <motion.button
                                key={`page-${page}`}
                                onClick={() => paginate(page)}
                                className={`px-4 py-2 font-semibold rounded-lg ${currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200  text-gray-900 "
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                {page}
                            </motion.button>
                        )
                    )}
                </div>

                {/* notification dialog */}
                <AlertDialog open={notificationModalOpen} onOpenChange={setNotificationModalOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Send Notification</AlertDialogTitle>
                            <AlertDialogDescription>
                                Choose who to notify for <strong>{selectedGameForNotification?.gameName}</strong>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex flex-col gap-4 mt-4">
                            <Button onClick={() => notifyUsers('all')} className="w-full cursor-pointer">
                                Notify All Users (Knife Throw App)
                            </Button>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-none cursor-pointer" onClick={() => setNotificationModalOpen(false)}>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div >
        )


    );
};

export { Knifethrowgamespage };
