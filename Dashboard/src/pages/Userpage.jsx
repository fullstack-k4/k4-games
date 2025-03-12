import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom";
import { useDispatch ,useSelector} from "react-redux";
import { getAllSecondaryAdmin } from "@/store/Slices/authSlice";
import { UsersList } from "./sub-components";
import { Loader } from "./sub-components";


const Userpage = () => {
  const dispatch=useDispatch();
  const users=useSelector((state)=>state.auth.secondaryAdmins);
  const [load,setload]=useState(true);

  useEffect(()=>{
    dispatch(getAllSecondaryAdmin()).then(()=>{
      setload(false);
    }); 
  },[]);


  const handleDelete = (email) => {
    console.log(`Delete user: ${email}`);
  };

  return (
    <>
    {load ? <Loader/> :(
      <div className="p-6">
      {/* Create User Button */}
      <Link to="/create-user">
        <div className="flex justify-end mb-4">
          <Button className="bg-blue-500 hover:bg-blue-600">Create User</Button>
        </div>
      </Link>


      {/* User Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <UsersList users={users}/>
          </TableBody>
        </Table>
      </div>
    </div>
    )}
    </>
  );
};

export { Userpage };
