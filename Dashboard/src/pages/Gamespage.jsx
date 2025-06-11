import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGames, makeGamesNull, deleteGame, getGameCategories } from "@/store/Slices/gameSlice";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader } from "./sub-components/";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { denyDownload } from "@/store/Slices/gameSlice";
import { denyFeatured } from "@/store/Slices/gameSlice";
import { denyRecommended } from "@/store/Slices/gameSlice";

const Gamespage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { games, loading } = useSelector((state) => state.game);
  const totalGames = useSelector((state) => state.game.games?.totalGames);
  const { deleting, deleted } = useSelector((state) => state.game);
  const { toggled } = useSelector((state) => state.game);
  const { categories } = useSelector((state) => state.game);
  const { admin } = useSelector((state) => state.auth);
  const userId = useSelector((state) => state.auth.userData?._id);

  const userRole = admin ? "admin" : "secondaryAdmin";
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [openCheck, setOpenCheck] = useState(false);
  const [openFeaturedCheck, setOpenFeaturedCheck] = useState(false);
  const [openRecommendedCheck, setOpenRecommendedCheck] = useState(false);
  const [loader, setloader] = useState(true);
  const debouncedQuery = useDebounce(searchQuery, 500); // Delay API calls
  const gamesPerPage = 10;





  // 🔹 Sync URL with state
  useEffect(() => {
    setSearchParams({ page: currentPage, query: searchQuery });
  }, [currentPage, setSearchParams, searchQuery])


  // Fetch Categories on mount

  useEffect(() => {
    dispatch(getGameCategories());
  }, [deleted])



  // 🔹 Fetch games when `currentPage` changes
  useEffect(() => {
    dispatch(makeGamesNull()); // Clear previous page data
    if (userId && userRole) {
      dispatch(getAllGames({ page: currentPage, limit: gamesPerPage, query: debouncedQuery, category: selectedCategory, userRole: userRole, userId: userId })).then(() => {
        setloader(false);
      });
    }

  }, [dispatch, currentPage, deleted, debouncedQuery, selectedCategory, toggled, userId, userRole]);

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
    console.log(selectedGame?._id);
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

  const handleCheckboxClick = (game) => {
    setSelectedGame(game);
    setOpenCheck(true);
  };

  const handleFeaturedCheckboxClick = (game) => {
    setSelectedGame(game);
    setOpenFeaturedCheck(true);
  }
  const handleRecommendedCheckboxClick = (game) => {
    setSelectedGame(game);
    setOpenRecommendedCheck(true);
  }

  const handleConfirm = () => {
    if (selectedGame && !selectedGame.downloadable) {
      navigate(`/upload-zip/${selectedGame?._id}`);
    }
    if (selectedGame && selectedGame.downloadable) {
      dispatch(denyDownload({ gameId: selectedGame?._id }));
    }
    setOpenCheck(false);
    setSelectedGame(null);
  };

  const handleFeatureConfirm = () => {
    if (selectedGame && !selectedGame?.isFeatured) {
      navigate(`/allow-featured/${selectedGame?._id}`);
    }

    if (selectedGame && selectedGame?.isFeatured) {
      dispatch(denyFeatured({ gameId: selectedGame?._id }));
    }
    setOpenCheck(false);
    setSelectedGame(null);
  }

  const handleRecommendedConfirm = () => {
    if (selectedGame && !selectedGame?.isRecommended) {
      navigate(`/allow-recommended/${selectedGame?._id}`);
    }

    if (selectedGame && selectedGame?.isRecommended) {
      dispatch(denyRecommended({ gameId: selectedGame?._id }));
    }

    setOpenCheck(false);
    setSelectedGame(null);
  }






  return (

    loader ? <Loader /> : (
      <div className="p-6 space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
            🎮 Game Management
          </h1>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 w-full rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
            />
          </div>
          <Link to="/add">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
              <Plus size={16} />
              <span className="font-semibold">New Game</span>
            </button>
          </Link>
        </div>


        {/* Category Dropdown */}
        <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category._id} value={category._id}>
                {category._id} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Table */}

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <table className="min-w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 text-left text-md font-semibold">#</th>
                <th className="p-4 text-left text-md font-semibold">Game Name</th>
                <th className="p-4 text-left text-md font-semibold">Description</th>
                <th className="p-4 text-left text-md font-semibold">Category</th>
                <th className="p-4 text-left text-md font-semibold">Image</th>
                <th className="p-4 text-left text-md font-semibold">Source</th>
                <th className="p-4  text-md font-semibold text-center">Top 10 Count</th>
                <th className="p-4 text-center text-md font-semibold">Download Allowed</th>
                <th className="p-4  text-center text-md font-semibold">Featured</th>
                <th className="p-4  text-center text-md font-semibold">Recommended</th>
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
                  <tr key={game._id} className="border-b dark:border-gray-700">
                    <td className="p-4 font-medium">
                      {totalGames - ((currentPage - 1) * gamesPerPage + index)}
                    </td>

                    {/* Game Name */}
                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                      {game.gameName}
                    </td>

                    {/* Game Description */}
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {game.description.split(" ").slice(0, 4).join(" ")}...
                    </td>

                    {/* Game Category */}
                    <td className="p-4 font-semibold">
                      {game?.category[0] + "..."}
                    </td>

                    {/* Game Image */}

                    <td className="p-4">
                      <motion.img
                        src={game.imageUrl}
                        alt={game.gameName}
                        className="w-16 h-16 rounded-lg shadow-md"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                    </td>

                    {/* Game Source */}
                    <td className="p-4">
                      <Badge
                        className={`px-3 py-1 font-bold ${game.gameSource === "self" ? "bg-green-500" : "bg-blue-500"
                          }`}
                      >
                        {game.gameSource === "self" ? "Self" : "Link"}
                      </Badge>
                    </td>

                    {/* Top 10 Count */}
                    <td className=" font-semibold text-center  ">{game.topTenCount}</td>


                    {/* Download Allowed */}
                    <td className=" text-center font-semibold">
                      <AlertDialog open={openCheck} onOpenChange={setOpenCheck}>
                        <AlertDialogTrigger asChild>
                          <input
                            type="checkbox"
                            checked={game.downloadable}
                            onChange={() => handleCheckboxClick(game)}
                            className="cursor-pointer"
                          />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to update the download status?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirm} >OK</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>

                    {/* Featured Checkbox */}
                    <td className=" text-center font-semibold">
                      <AlertDialog open={openFeaturedCheck} onOpenChange={setOpenFeaturedCheck} >
                        <AlertDialogTrigger asChild>
                          <input
                            type="checkbox"
                            checked={game?.isFeatured}
                            onChange={() => handleFeaturedCheckboxClick(game)}
                            className="cursor-pointer"
                          />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to update the Featured status?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFeatureConfirm} >OK</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>


                    {/* Recommended Checkbox */}
                    <td className=" text-center font-semibold ">
                      <AlertDialog open={openRecommendedCheck} onOpenChange={setOpenRecommendedCheck} >
                        <AlertDialogTrigger asChild>
                          <input
                            type="checkbox"
                            checked={game?.isRecommended}
                            onChange={() => handleRecommendedCheckboxClick(game)}
                            className="cursor-pointer"
                          />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to update the Recommended status?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRecommendedConfirm} >OK</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>



                    {/* Actions */}

                    <td className="p-4 space-x-3">
                      <Link to={`/edit/${game?._id}`}>
                        <button className="text-blue-500 hover:scale-110 transition">
                          <Pencil size={20} />
                        </button>
                      </Link>


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
                key={`page-${page}`}  // 🔥 Unique key fix
                onClick={() => paginate(page)}
                className={`px-4 py-2 font-semibold rounded-lg ${currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  }`}
                whileHover={{ scale: 1.1 }}
              >
                {page}
              </motion.button>
            )
          )}
        </div>
      </div >
    )


  );
};

export { Gamespage };
