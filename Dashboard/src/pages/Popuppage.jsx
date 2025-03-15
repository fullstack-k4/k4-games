import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPopUp, deletePopup } from "@/store/Slices/popupSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Loader } from "./sub-components";


const Popuppage = () => {
    const dispatch = useDispatch();
    const { popups, deleted, deleting } = useSelector(state => state.popup);
    const [open, setOpen] = useState(false);
    const [selectedPopup, setSelectedPopup] = useState("");
    const [loader, setloader] = useState(true);


    useEffect(() => {
        dispatch(getAllPopUp()).then(() => {
            setloader(false);
        });
    }, [dispatch, deleted]);

    const handleDeleteButttonClick = (popup) => {
        setOpen(true);
        setSelectedPopup(popup);
    }


    const handleDelete = async (popup) => {
        if (selectedPopup) {
            let response = await dispatch(deletePopup({ id: selectedPopup?._id }));

            if (response?.type === "deletePopUp/fulfilled") {
                setOpen(false);
            }
        }
    };




    return (
        loader ? <Loader /> : (
            <div className="p-6 flex justify-center">
                <div className="w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Popups</h2>
                        <Link to="/create-popup">
                            <Button>Create Popup</Button>
                        </Link>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                popups.map((popup) => (
                                    <TableRow key={popup._id}>
                                        <TableCell>
                                            <img src={popup.imageUrl} alt="Popup" className="w-16 h-16 object-cover" />
                                        </TableCell>
                                        <TableCell>

                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" onClick={() => handleDeleteButttonClick(popup)} >
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
                                                        <Button variant="destructive" onClick={() => handleDelete(popup)} disabled={deleting}>
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

export { Popuppage }
