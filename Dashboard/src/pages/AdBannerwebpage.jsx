import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAdBannersweb, deleteAdBannerweb } from "@/store/Slices/addbannerwebSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Loader } from "./sub-components";


const AdBannerwebpage = () => {
    const dispatch = useDispatch();
    const { adbannersweb, deleted, deleting } = useSelector(state => state.adbannerweb);
    const [open, setOpen] = useState(false);
    const [selectedAdBannerWeb, setSelectedAdBannerWeb] = useState("");
    const [loader, setloader] = useState(true);


    useEffect(() => {
        dispatch(getAllAdBannersweb()).then(() => {
            setloader(false);
        });
    }, [dispatch, deleted]);

    const handleDeleteButttonClick = (adbannerweb) => {
        setOpen(true);
        setSelectedAdBannerWeb(adbannerweb);
    }


    const handleDelete = async () => {
        if (selectedAdBannerWeb) {
            let response = await dispatch(deleteAdBannerweb({ id: selectedAdBannerWeb?._id }));
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
                        <h2 className="text-xl font-semibold">Website Ads</h2>
                        <Link to="/create-adbannerweb">
                            <Button>Create Website Ads</Button>
                        </Link>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Uploaded Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                adbannersweb.map((adbanner) => (
                                    <TableRow key={adbanner?._id}>
                                        <TableCell>
                                            {adbanner?.imageUrl ? (
                                                <img
                                                    src={adbanner.imageUrl}
                                                    alt="AdBanner"
                                                    className="w-16 h-16 object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src="/adsense.jpg"
                                                    alt="AdBanner"
                                                    className="w-16 h-16 object-contain"
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {adbanner?.type}
                                        </TableCell>
                                        <TableCell>
                                            {adbanner?.position}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(adbanner?.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell>

                                            <AlertDialog open={open} onOpenChange={setOpen} >
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" onClick={() => handleDeleteButttonClick(adbanner)} >
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
                                                        <Button variant="destructive" onClick={() => handleDelete()} disabled={deleting}>
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

export { AdBannerwebpage }
