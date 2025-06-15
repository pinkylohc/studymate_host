"use client";

import { useState } from "react";
import axios from "axios";
import FileLoader from "../generator/file_loader";
import { ProcessingModal } from "../generator/loading_modal";
import { BookOpenIcon, TagIcon, FolderIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface MaterialUploadFormProps {
  userEmail?: string | null;
}

export default function MaterialUploadForm({ userEmail }: MaterialUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [topic, setTopic] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [usePrecisePDFMode, setUsePrecisePDFMode] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    if (!files.length || !courseCode || !topic) {
      setError("Please fill all required fields");
      return;
    }

    if (!userEmail && !collectionName) {
      setError("Either user email or collection name is required");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      formData.append("document_type", "Auto");
      formData.append("course_code", courseCode);
      formData.append("topic", topic);
      formData.append("precise_pdf", usePrecisePDFMode.toString());
      if (userEmail) formData.append("user_email", userEmail);
      if (collectionName) formData.append("collection_name", collectionName);

      await axios.post("http://localhost:8000/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFiles([]);
      setCourseCode("");
      setTopic("");
      setCollectionName("");
      setSuccess(true);
    } catch (err) {
      setError("Error uploading file(s)");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-8 max-w-4xl mx-auto w-full"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <BookOpenIcon className="h-5 w-5 text-gray-400" />
            <span>Course Code</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., CS101"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <TagIcon className="h-5 w-5 text-gray-400" />
            <span>Topic</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., Introduction to Programming"
            required
          />
        </div>
      </div>

      {!userEmail && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <FolderIcon className="h-5 w-5 text-gray-400" />
            <span>Collection Name (for developer use)</span>
          </label>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="e.g., cs101_materials"
          />
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200/75 shadow-sm">
        <FileLoader 
          files={files} 
          setFiles={setFiles} 
          inputType="All" 
          usePrecisePDFMode={usePrecisePDFMode}
          setUsePrecisePDFMode={setUsePrecisePDFMode}
        />
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100"
        >
          Materials uploaded successfully!
        </motion.div>
      )}

      <div className="flex justify-end">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
          text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 
          flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md"
          disabled={isUploading}
        >
          {isUploading ? (
            <span>Uploading...</span>
          ) : (
            <span>Upload Materials</span>
          )}
        </motion.button>
      </div>

      <ProcessingModal isVisible={isUploading} message="Uploading material(s)..." />
    </form>
  );
}