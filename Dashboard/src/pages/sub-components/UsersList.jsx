import React, { useState } from 'react'
import { Trash,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {  useDispatch } from 'react-redux';
import { TableCell, TableRow } from '@/components/ui/table';
import { deleteSecondaryAdmin } from '@/store/Slices/authSlice';

const UsersList = ({ users }) => {
    const dispatch = useDispatch();
    const [loadingId, setLoadingId] = useState(null);
    const handleDelete = async (id) => {

        setLoadingId(id);
       const response= await dispatch(deleteSecondaryAdmin({ id }));

       if(response.meta.requestStatus === "fulfilled"){
        setLoadingId(null);
       }
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
                            disabled={loadingId}
                        >
                            {loadingId===user?._id ? (
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