
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllForms, deleteForm, makeFormsNull } from "@/store/Slices/formSlice";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader } from "./sub-components";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { DownloadButton } from "./sub-components";

const UserFormpage = () => {
  const dispatch = useDispatch();
  const { forms, loading } = useSelector((state) => state.form);
  const { deleting, deleted } = useSelector((state) => state.form);
  const totalForms = useSelector((state) => state.form.forms?.totalForms);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedForm, setSelectedForm] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [loader, setloader] = useState(true);
  const formsPerPage = 10;


  // 🔹 Sync URL with state
  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage, setSearchParams])


  // fetch all forms
  useEffect(() => {
    dispatch(makeFormsNull()); // Clear previous page data
    dispatch(getAllForms({page: currentPage, limit: formsPerPage })).then(() => {
      setloader(false);
    });
  }, [dispatch, deleted, currentPage]);





  const handleDeleteButttonClick = (form) => {
    setOpen(true);
    setSelectedForm(form);
  }


  const handleDelete = async (form) => {
    if (selectedForm) {
      let response = await dispatch(deleteForm({ id: selectedForm?._id }));

      if (response.meta.requestStatus === "fulfilled") {
        setOpen(false);
      }


    }
  };

  // 🔹 Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(makeFormsNull());
    };
  }, [dispatch]);

  // 🔹 Pagination click handler (updates URL & state)
  const paginate = useCallback(
    (pageNumber) => {
      if (pageNumber !== currentPage) {
        setCurrentPage(pageNumber);
      }
    },
    [currentPage]
  );
  // Pagination Logic
  const totalPages = forms?.totalPages || 1;
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



  const getJsonData = (data) => {
    return data.map((d) => ({
      name: d.name,
      email: d.email,
      phoneNumber: d.phoneNumber,
      description: d.description,
      attachmentUrl: d.attachmentUrl,
    }));
  };


  const handleDownload = () => {
    // Convert JSON data to a worksheet
    const ws = XLSX.utils.json_to_sheet(getJsonData(forms.docs));

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Write the workbook and convert it to a Blob
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Trigger the download using FileSaver
    saveAs(data, "UserData.xlsx");
  };




  return (
    loader ? <Loader /> : (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900  text-center sm:text-left">
            Form Management
          </h1>

          {/* Download Excel Button */}
          <Button disabled={forms.docs.length===0} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" onClick={handleDownload}>Download Excel</Button>

        </div>





        {/* Table */}

        <div className="overflow-x-auto bg-white  rounded-lg shadow-lg">
          <table className="min-w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 text-left text-lg font-semibold">#</th>
                <th className="p-4 text-left text-lg font-semibold">Name</th>
                <th className="p-4 text-left text-lg font-semibold">Email</th>
                <th className="p-4 text-left text-lg font-semibold">Phone Number</th>
                <th className="p-4 text-left text-lg font-semibold">Description</th>
                <th className="p-4 text-left text-lg font-semibold">Download</th>
                <th className="p-4 text-left text-lg font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center p-4">Loading...</td>
                </tr>
              ) : forms?.docs?.length > 0 ? (
                forms.docs.map((form, index) => (
                  <tr key={form._id} className="border-b ">
                    <td className="p-4 font-medium ">
                      {totalForms - ((currentPage - 1) * formsPerPage + index)}
                    </td>

                    {/* name */}
                    <td className="p-4 font-bold text-gray-900 ">
                      {form.name}
                    </td>

                    {/* email */}
                    <td className="p-4 font-bold text-gray-900 ">
                      {form.email}
                    </td>
                    {/* phone number */}
                    <td className="p-4 font-bold text-gray-900 ">
                      {form.phoneNumber}
                    </td>

                    {/*  description */}
                    <td className="p-4 text-gray-700 ">
                      {form.description.split(" ").slice(0, 4).join(" ")}...
                    </td>
                    

                    {/* Download Attachment Button */}
                    <td className="p-4">
                      <DownloadButton fileUrl={form?.attachmentUrl} username={form?.name}/>
                    </td>
                    {/* Actions */}

                    <td className="p-4 space-x-3">
                      <AlertDialog open={open} onOpenChange={setOpen} >
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" onClick={() => handleDeleteButttonClick(form)} >
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
                            <Button variant="destructive" onClick={() => handleDelete(form)} disabled={deleting}>
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
                  <td colSpan="9" className="text-center p-4">No Forms found.</td>
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
              <motion.button
                key={`page-${page}`}  
                onClick={() => paginate(page)}
                className={`px-4 py-2 font-semibold rounded-lg ${currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200  text-gray-900 "
                  }`}
                whileHover={{ scale: 1.1 }}
              >
                {page}
              </motion.button>
            )
          )}
        </div>
      </div >
    ))
}

export { UserFormpage }