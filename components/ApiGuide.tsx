import React from 'react';

interface ApiGuideProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ApiGuide: React.FC<ApiGuideProps> = ({ isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-indigo-500/50 rounded-lg p-4 relative text-sm space-y-3">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Đóng hướng dẫn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h3 className="font-bold text-indigo-400 text-base mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Lưu ý Quan trọng về Giới hạn Sử dụng
      </h3>
      
      <p className="text-gray-300">
        API miễn phí có giới hạn nghiêm ngặt. Nếu gặp lỗi, rất có thể bạn đã đạt đến giới hạn. Để sử dụng không giới hạn, bạn cần một API Key riêng từ <strong className="text-white">Google Cloud</strong>.
      </p>

      <div>
        <h4 className="font-semibold text-white">Giới hạn thông thường (Gói Miễn phí):</h4>
        <ul className="list-disc list-inside text-gray-400 mt-1">
          <li><strong>Tạo kịch bản (Văn bản):</strong> Khoảng 60 yêu cầu mỗi phút.</li>
          <li><strong>Tạo Video (Veo):</strong> Giới hạn thấp hơn nhiều, thường chỉ một vài video mỗi ngày.</li>
        </ul>
      </div>

      <p className="text-gray-400">
        <span className="font-bold text-amber-400">Quan trọng:</span> Gói đăng ký cá nhân như Google One <strong className="underline">KHÔNG</strong> cung cấp API Key và không thể sử dụng cho ứng dụng này.
      </p>

      <div className="flex items-center space-x-3 pt-2">
         <a
          href="https://console.cloud.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Tới Google Cloud để Thiết lập
        </a>
         <a
          href="https://console.cloud.google.com/vertex-ai/quotas"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Xem Hạn ngạch (Quota)
        </a>
      </div>
    </div>
  );
};