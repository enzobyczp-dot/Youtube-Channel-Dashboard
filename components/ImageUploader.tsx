import React, { useRef, useState, useCallback } from 'react';

interface ImageUploaderProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isDisabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ imageFile, setImageFile, isDisabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');

  const processFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setUploadStatus('success');
      setTimeout(() => {
        setImageFile(file);
        setUploadStatus('idle');
      }, 1200); // Hiển thị thông báo thành công trong 1.2 giây
    } else if (file) {
      alert("Vui lòng chỉ chọn tệp hình ảnh.");
    }
  }, [setImageFile]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isDisabled) {
      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        processFile(event.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
            Tải lên hình ảnh (Tùy chọn)
        </label>
        {imageFile ? (
            <div className="mt-2 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                <span className="text-sm text-gray-300 truncate pr-2">{imageFile.name}</span>
                <button
                    onClick={handleRemoveImage}
                    className="text-red-400 hover:text-red-300 text-xs font-bold"
                    disabled={isDisabled}
                >
                    XÓA
                </button>
            </div>
        ) : (
            <div className="flex items-center justify-center w-full">
                <label 
                    htmlFor="dropzone-file" 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 transition-colors ${isDragging ? 'border-indigo-500 bg-gray-600' : 'hover:bg-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploadStatus === 'success' ? (
                        <div className="flex flex-col items-center justify-center text-green-400">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <p className="mt-1 font-semibold text-sm">Tải lên thành công!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo thả</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP (Tối đa 5MB)</p>
                        </div>
                    )}
                    <input 
                        id="dropzone-file" 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        disabled={isDisabled}
                    />
                </label>
            </div>
        )} 
    </div>
  );
};