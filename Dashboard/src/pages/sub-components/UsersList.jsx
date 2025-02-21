import React from 'react'
import { Trash,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from 'react-redux';
import { TableCell, TableRow } from '@/components/ui/table';
import { deleteSecondaryAdmin } from '@/store/Slices/authSlice';

const UsersList = ({ users }) => {
    const dispatch = useDispatch();
    const deleting = useSelector((state) => state.auth.deleting);

    const handleDelete = async (id) => {
        await dispatch(deleteSecondaryAdmin({ id }));
    }

    


    return (
        <>
            {users && users.map((user, index) => (
                <TableRow key={index}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(user?._id)}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash className="w-4 h-4" />
                            )}
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </>)
}

export { UsersList }