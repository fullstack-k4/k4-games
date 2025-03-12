import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories,deleteCategory } from "@/store/Slices/categorySlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel} from "@/components/ui/alert-dialog";
import { Loader } from "./sub-components";
import { Link } from "react-router-dom";


const Categorypage = () => {
    const dispatch = useDispatch();
    const { categories, deleted, deleting,adding } = useSelector(state => state.category);
    const [open, setOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loader, setloader] = useState(true);

    useEffect(() => {
        dispatch(getAllCategories()).then(() => {
            setloader(false);
        });
    }, [dispatch, deleted]);

   const handleDeleteButttonClick = (category) => {
        setOpen(true);
        setSelectedCategory(category);

    }


    const handleDelete = async (category) => {
        if (selectedCategory) {
            let response = await dispatch(deleteCategory({ id: selectedCategory?._id }));

            if (response.meta.requestStatus === "fulfilled") {
                setOpen(false);
            }
        }
    };


    return (
        loader ? <Loader /> : (
            <div className="p-6 flex justify-center">
                <div className="w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Categories</h2>
                        <Link to="/create-category">
                            <Button>Create Category</Button>
                        </Link>
                        
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                               categories && categories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell>
                                            {category.name}
                                        </TableCell>
                                        <TableCell>
                                            <img src={category.imageUrl} alt="Category" className="w-16 h-16 object-cover" />
                                        </TableCell>
                                        <TableCell>

                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" onClick={() => handleDeleteButttonClick(category)} >
                                                        Delete
                                                    </Button>
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

                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    );
}

export { Categorypage }
