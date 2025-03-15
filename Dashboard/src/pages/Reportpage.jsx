
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReports, deleteReport, makeReportsNull } from "@/store/Slices/reportSlice";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Loader } from "./sub-components";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useSearchParams,Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {Trash,Pencil} from "lucide-react"


const Reportpage = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.report);
  const { deleting, deleted } = useSelector((state) => state.report);
  const totalReports = useSelector((state) => state.report.reports?.totalReports);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedReport, setSelectedReport] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [loader, setloader] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState("");
  const reportsPerPage = 10;


  // 🔹 Sync URL with state
  useEffect(() => {
    setSearchParams({ page: currentPage });
  }, [currentPage, setSearchParams])


  // fetch all reports
  useEffect(() => {
    dispatch(makeReportsNull()); // Clear previous page data
    dispatch(getAllReports({ type: selectedReportType, page: currentPage, limit: reportsPerPage })).then(() => {
      setloader(false);
    });
  }, [dispatch, deleted, selectedReportType, currentPage]);


  const handleDeleteButttonClick = (report) => {
    setOpen(true);
    setSelectedReport(report);
  }


  const handleDelete = async (report) => {
    if (selectedReport) {
      let response = await dispatch(deleteReport({ id: selectedReport?._id }));

      if (response.meta.requestStatus === "fulfilled") {
        setOpen(false);
      }
    }
  };

  // 🔹 Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(makeReportsNull());
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
  const totalPages = reports?.totalPages || 1;
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

  // report types array

  const reportTypes = [
    { _id: 1, name: "Bug" },
    { _id: 2, name: "Error" },
    { _id: 3, name: "Other" }
  ]

  // to get colour of badeges according to report type
  const getBadgeStyles = (reportType) => {
    switch (reportType.toLowerCase()) {
      case "bug":
        return "bg-red-500 text-white"; // Red badge for Bugs
      case "error":
        return "bg-yellow-500 text-black"; // Yellow badge for Errors
      case "other":
        return "bg-gray-500 text-white"; // Gray badge for Other reports
      default:
        return "bg-blue-500 text-white"; // Default color
    }
  };



   const getJsonData = (data) => {
      return data.map((d) => ({
        gameName: d.gameName,
        description: d.reportDescription,
        reportType:d.reportType
      }));
    };
  
  
    const handleDownload = () => {
      // Convert JSON data to a worksheet
      const ws = XLSX.utils.json_to_sheet(getJsonData(reports.docs));
  
      // Create a new workbook and append the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
      // Write the workbook and convert it to a Blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  
      // Trigger the download using FileSaver
      saveAs(data, "Reports.xlsx");
    };


  return (
    loader ? <Loader /> : (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center sm:text-left">
            Reports Management
          </h1>

          {/* Download Excel Button */}
          <Button disabled={reports.docs.length===0} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" onClick={handleDownload}>Download Excel</Button>
        </div>



        <div className="flex flex-row flex-wrap gap-2">
          {/* Report Type Filter Dropdown */}
          <Select value={selectedReportType || "all"} onValueChange={(value) => setSelectedReportType(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Report Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Report Types</SelectItem>
              {reportTypes?.map((reportType) => (
                <SelectItem key={reportType._id} value={reportType.name}>
                  {reportType.name}
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
                <th className="p-4 text-left text-lg font-semibold">#</th>
                <th className="p-4 text-left text-lg font-semibold">Name</th>
                <th className="p-4 text-left text-lg font-semibold">Thumbnail</th>
                <th className="p-4 text-left text-lg font-semibold">Report Type</th>
                <th className="p-4 text-left text-lg font-semibold">Description</th>
                <th className="p-4 text-left text-lg font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center p-4">Loading...</td>
                </tr>
              ) : reports?.docs?.length > 0 ? (
                reports.docs.map((report, index) => (
                  <tr key={report._id} className="border-b dark:border-gray-700">
                    <td className="p-4 font-medium ">
                      {totalReports - ((currentPage - 1) * reportsPerPage + index)}
                    </td>

                    {/* name */}
                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                      {report.gameName}
                    </td>

                    {/* thumbnail */}
                    <td className="p-4">
                      <motion.img
                        src={report.imageUrl}
                        alt={report.gameName}
                        className="w-16 h-16 rounded-lg shadow-md"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                    </td>

                    {/* report type */}
                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                      <Badge className={getBadgeStyles(report.reportType)}>
                        {report.reportType}
                      </Badge>
                    </td>

                    {/*  description */}
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      {report.reportDescription.split(" ").slice(0, 4).join(" ")}...
                    </td>
                    {/* Actions */}
                    <td className="p-4 space-x-3">
                      <Link to={`/edit/${report?.gameId}`}>
                        <button className="text-blue-500 hover:scale-110 transition">
                          <Pencil size={20} />
                        </button>
                      </Link>


                      <AlertDialog open={open} onOpenChange={setOpen} >
                        <AlertDialogTrigger asChild>
                          <button className="text-red-500 hover:scale-110 transition" onClick={() => handleDeleteButttonClick(report)}>
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
                            <Button variant="destructive" onClick={() => handleDelete(report)} disabled={deleting}>
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
                  <td colSpan="9" className="text-center p-4">No Reports found.</td>
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
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
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

export { Reportpage }