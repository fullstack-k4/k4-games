import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPages, deletePage } from "@/store/Slices/pageSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader } from "./sub-components";
import { Link } from "react-router-dom";
import { Pencil, Trash } from "lucide-react";


const Pages = () => {
    const dispatch = useDispatch();
    const { pages, deleted, deleting } = useSelector(state => state.page);
    const [open, setOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState("");
    const [loader, setloader] = useState(true);

    useEffect(() => {
        dispatch(getAllPages()).then(() => {
            setloader(false);
        });
    }, [dispatch, deleted]);

    const handleDeleteButttonClick = (page) => {
        setOpen(true);
        setSelectedPage(page);
    }


    const handleDelete = async () => {
        if (selectedPage) {
            let response = await dispatch(deletePage({ id: selectedPage?._id }));

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
                        <h2 className="text-xl font-semibold">Pages</h2>
                        <Link to="/create-page">
                            <Button>Create Page</Button>
                        </Link>

                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                pages && pages.map((page) => (
                                    <TableRow key={page._id}>
                                        <TableCell>
                                            {page.name}
                                        </TableCell>
                                        <TableCell>
                                            {page.slug}
                                        </TableCell>
                                        <TableCell className="p-4 space-x-3">
                                            <Link to={`/edit-page/${page?.slug}`}>
                                                <button className="text-blue-500 hover:scale-110 transition cursor-pointer">
                                                    <Pencil size={20} />
                                                </button>
                                            </Link>
                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <button className="text-red-500 hover:scale-110 cursor-pointer transition" onClick={() => handleDeleteButttonClick(page)}>
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
                                                        <Button variant="destructive" onClick={() => handleDelete(page)} disabled={deleting}>
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

export { Pages }
