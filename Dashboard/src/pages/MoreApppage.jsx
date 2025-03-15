import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {deleteApp,getAllApps } from "@/store/Slices/appSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Loader } from "./sub-components";


const MoreApppage = () => {
    const dispatch = useDispatch();
    const { apps, deleted, deleting } = useSelector(state => state.app);
    const [open, setOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState("");
    const [loader, setloader] = useState(true);


    useEffect(() => {
        dispatch(getAllApps()).then(()=>{
            setloader(false);
        });
    }, [dispatch, deleted]);

    const handleDeleteButttonClick = (app) => {
        setOpen(true);
        setSelectedApp(app);
    }

    const handleDelete = async (app) => {
        if (selectedApp) {
            let response = await dispatch(deleteApp({ id: selectedApp?._id }));

            if (response.meta.requestStatus === "fulfilled") {
                setOpen(false);
            }


        }
    };




    return (
        loader ? <Loader/> :(
            <div className="p-6 flex justify-center">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">More Apps</h2>
                    <Link to="/create-app">
                    <Button>Create App</Button>
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
                            apps.map((app) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        <img src={app.imageUrl} alt="App" className="w-16 h-16 object-cover" />
                                    </TableCell>
                                    <TableCell>

                                        <AlertDialog open={open} onOpenChange={setOpen} >
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" onClick={() => handleDeleteButttonClick(app)} >
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
                                                    <Button variant="destructive" onClick={() => handleDelete(app)} disabled={deleting}>
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

export { MoreApppage }
