import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategoriesDashboard, makeDashboardCategoriesNull, deleteCategory } from "@/store/Slices/categorySlice";
import { Pencil, Trash, Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader } from "./sub-components/";
import { Button } from "@/components/ui/button";


const Categorypage = () => {
    const dispatch = useDispatch();
    const { categoriesDashboard, loading } = useSelector((state) => state.category);
    const totalCategories = useSelector((state) => state.category.categoriesDashboard?.totalCategories);
    const { deleting, deleted } = useSelector((state) => state.category);

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
        dispatch(makeDashboardCategoriesNull()); // Clear previous page data
        dispatch(getAllCategoriesDashboard({ page: currentPage, limit: categoriesPerPage, query: debouncedQuery, filterBy: selectedFilter })).then(() => {
            setloader(false);
        });
    }, [dispatch, currentPage, deleted, debouncedQuery, selectedFilter]);

    // 🔹 Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(makeDashboardCategoriesNull());
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
    const totalPages = categoriesDashboard?.totalPages || 1;
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


    const filters = [
        {
            _id: 1,
            name: "Sidebar",
            value: "sidebar"
        },

    ]

    return (
        loader ? <Loader /> : (
            <div className="p-6 space-y-6">
                {/* Header & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
                        Category Management
                    </h1>
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <Input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-3 py-2 w-full rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                        />
                    </div>
                    <Link to="/create-category">
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                            <Plus size={16} />
                            <span className="font-semibold">New Category</span>
                        </button>
                    </Link>
                </div>


                <div className="flex flex-row gap-1">

                    <Select value={selectedFilter || "all"} onValueChange={(value) => setSelectedFilter(value === "all" ? "" : value)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Filters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Filters</SelectItem>
                            {filters?.map((filter) => (
                                <SelectItem key={filter._id} value={filter.value}>
                                    {filter.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <table className="min-w-full">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="p-4 text-left text-md font-semibold">#</th>
                                <th className="p-4 text-left text-md font-semibold">Name</th>
                                <th className="p-4 text-left text-md font-semibold">Image</th>
                                <th className="p-4 text-left text-md font-semibold">Icon</th>
                                <th className="p-4 text-left text-md font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center p-4">Loading...</td>
                                </tr>
                            ) : categoriesDashboard?.docs?.length > 0 ? (
                                categoriesDashboard.docs.map((category, index) => (
                                    <tr key={category._id} className="border-b dark:border-gray-700">
                                        <td className="p-4 font-medium">
                                            {totalCategories - ((currentPage - 1) * categoriesPerPage + index)}
                                        </td>

                                        {/* Category Name */}
                                        <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                                            {category?.name}
                                        </td>



                                        {/*  Image */}
                                        <td className="p-4 relative">
                                            <img src={category.imageUrl} alt="Category" className="w-16 h-16 object-cover" />
                                        </td>

                                        {/* Icon */}
                                        <td className="p-4 relative">
                                            <img src={category.iconUrl} alt="Icon" className="w-16 h-16 object-cover" />
                                        </td>


                                        {/* Actions */}

                                        <td className="p-4 space-x-3">
                                            <Link to={`/edit-category/${category?._id}`}>
                                                <button className="text-blue-500 hover:scale-110 transition">
                                                    <Pencil size={20} />
                                                </button>
                                            </Link>


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
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                    }`}
                                whileHover={{ scale: 1.1 }}
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

export { Categorypage };
