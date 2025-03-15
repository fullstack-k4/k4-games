import React from "react";
import { Download } from "lucide-react";

const DownloadButton = ({ fileUrl,username }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Extract file extension from URL
      const fileExtension = fileUrl.split(".").pop().split("?")[0]; // Handles URLs with query params

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${username}.${fileExtension}`); // Set correct extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke URL to free memory
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="text-blue-400 hover:text-blue-600 transition duration-200"
    >
      <Download className="w-6 h-6 hover:scale-110 transition-transform duration-200" />
    </button>
  );
};

export { DownloadButton };
