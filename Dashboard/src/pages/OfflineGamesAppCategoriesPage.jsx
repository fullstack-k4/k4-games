import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories, makeCategoriesNull, deleteCategory } from "@/store/Slices/offlinegamesappcategorySlice";
import {  Trash, Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader } from "./sub-components/";
import { Button } from "@/components/ui/button";


const OfflineGamesAppCategoriesPage = () => {
    const dispatch = useDispatch();
    const { categories, loading, deleting, deleted } = useSelector((state) => state.offlinegamesappcategory)
    const totalCategories = useSelector((state) => state.offlinegamesappcategory.categories?.totalCategories);
    const [open, setOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loader, setloader] = useState(true);
    const debouncedQuery = useDebounce(searchQuery, 500); // Delay API calls
    const categoriesPerPage = 10;




    // 🔹 Sync URL with state
    useEffect(() => {
        setSearchParams({ page: currentPage, query: searchQuery });
    }, [currentPage, setSearchParams, searchQuery])

    // 🔹 Fetch categories when `currentPage` changes
    useEffect(() => {
        dispatch(makeCategoriesNull()); // Clear previous page data
        dispatch(getAllCategories({ page: currentPage, limit: categoriesPerPage, query: debouncedQuery, filterBy: selectedFilter })).then(() => {
            setloader(false);
        });
    }, [dispatch, currentPage, deleted, debouncedQuery, selectedFilter]);

    // 🔹 Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(makeCategoriesNull());
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


    const handleDeleteButttonClick = (category) => {
        setOpen(true);
        setSelectedCategory(category);
    }

    const handleDelete = async () => {
        if (selectedCategory) {
            let response = await dispatch(deleteCategory({ id: selectedCategory?._id }));

            if (response.meta.requestStatus === "fulfilled") {
                setOpen(false);
            }
        }
    };

    // Pagination Logic
    const totalPages = categories?.totalPages || 1;
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




    return (
        loader ? <Loader /> : (
            <div className="p-6 space-y-6">
                {/* Header & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900  text-center sm:text-left">
                        Category Management
                    </h1>
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <Input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 w-full rounded-lg border   text-gray-900 "
                        />
                    </div>
                    <Link to="/offlinegamesapp/create-category">
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                            <Plus size={16} />
                            <span className="font-semibold">New Category</span>
                        </button>
                    </Link>
                </div>



                {/* Table */}

                <div className="overflow-x-auto bg-white  rounded-lg shadow-lg">
                    <table className="min-w-full">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="p-4 text-left text-md font-semibold">#</th>
                                <th className="p-4 text-left text-md font-semibold">Name</th>
                                <th className="p-4 text-left text-md font-semibold">Image</th>
                                <th className="p-4 text-left text-md font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-4">Loading...</td>
                                </tr>
                            ) : categories?.docs?.length > 0 ? (
                                categories.docs.map((category, index) => (
                                    <tr key={category._id} className="border-b ">
                                        <td className="p-4 font-medium">
                                            {totalCategories - ((currentPage - 1) * categoriesPerPage + index)}
                                        </td>

                                        {/* Category Name */}
                                        <td className="p-4 font-bold text-gray-900 ">
                                            {category?.name}
                                        </td>

                                        {/*  Image */}
                                        <td className="p-4 relative">
                                            <img src={category.imageUrl} alt="Category" className="w-16 h-16 object-cover" />
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 space-x-3">
                                        
                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-red-500 hover:scale-110 transition" onClick={() => handleDeleteButttonClick(category)}>
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
                                                        <Button variant="destructive" onClick={() => handleDelete(category)} disabled={deleting}>
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
                                    <td colSpan="9" className="text-center p-4">No Categories found.</td>
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
                            <button
                                key={`page-${page}`}
                                onClick={() => paginate(page)}
                                className={`px-4 py-2 font-semibold rounded-lg ${currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200  text-gray-900 "
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
            </div >
        )


    );
};

export { OfflineGamesAppCategoriesPage };
