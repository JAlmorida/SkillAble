import React from "react";
import { X, FileText, Download, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

const FileCard = ({
  file,
  onDelete,
  error, // pass error message as prop if needed
  showDownload = true, // optionally hide download button for errors
  showDelete = true, // <-- add this line
}) => {
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-[#23232a] w-full shadow`}
    >
      <FileText className={`w-6 h-6 ${error ? "text-red-500" : "text-blue-400"}`} />
      <div className="flex-1 min-w-0">
        <span
          className={`block truncate font-medium ${
            error ? "text-red-600" : "text-gray-900 dark:text-white"
          }`}
        >
          {file.name}
        </span>
        {error && (
          <span className="block text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </span>
        )}
      </div>
      {!error && showDownload && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </Button>
      )}
      {showDelete && ( // <-- wrap delete button
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className={`ml-1 ${error ? "text-red-500" : "text-gray-400"} hover:bg-red-100 dark:hover:bg-red-900`}
          title="Remove"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default FileCard;
