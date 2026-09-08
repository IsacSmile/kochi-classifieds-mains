"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, AlertCircle, Image as ImageIcon, ExternalLink, Loader2, ArrowLeft } from "lucide-react";

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadedUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedUrl(data.url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-navy p-6 sm:p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-brand-navy flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-brand-green" />
              Cloudinary Integration Test
            </h1>
            <p className="text-xs text-slate-500">
              Test image uploads to Cloudinary (cloud: <code className="font-semibold text-brand-navy">m6fi2bs5</code>) before building business forms.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy font-semibold px-3 py-1.5 bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="bg-brand-card p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {uploadedUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Upload Successful! Cloudinary response received.
              </div>
              <div className="truncate font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 text-emerald-700 flex items-center justify-between">
                <span className="truncate">{uploadedUrl}</span>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 ml-2 text-brand-blue hover:underline flex items-center gap-1 font-sans text-xs font-bold"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-xs font-bold text-brand-navy">
              Select Image to Upload
            </label>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="mb-1 text-xs text-slate-700 font-semibold">
                    <span className="text-brand-green">Click to select</span> or drag & drop image file
                  </p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP, or SVG</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded border border-slate-200"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-brand-navy truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload to Cloudinary
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {uploadedUrl && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 text-center">
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider text-slate-400">
              Cloudinary Image Preview
            </h3>
            <div className="flex justify-center">
              <img
                src={uploadedUrl}
                alt="Cloudinary Upload"
                className="max-h-64 object-contain rounded-lg border border-slate-200 shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
