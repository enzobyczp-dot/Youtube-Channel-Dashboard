import React, { useState, useEffect, useCallback } from 'react';
import { validateApiKey } from '../services/geminiService';

type KeyStatus = 'unknown' | 'checking' | 'valid' | 'invalid';

interface ApiKey {
  value: string;
  status: KeyStatus;
  error?: string;
}

interface ApiKeyDashboardProps {
  initialKeys: string[];
  onKeysChange: (keys: string[]) => void;
  isDisabled: boolean;
}

const maskApiKey = (key: string): string => {
    if (key.length < 8) return '***';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

const StatusIndicator: React.FC<{ status: KeyStatus, error?: string }> = ({ status, error }) => {
    const baseClasses = "w-3 h-3 rounded-full flex-shrink-0";
    switch (status) {
        case 'valid':
            return <div className={`${baseClasses} bg-green-500`} title="Hợp lệ"></div>;
        case 'invalid':
            return <div className={`${baseClasses} bg-red-500`} title={`Không hợp lệ: ${error || ''}`}></div>;
        case 'checking':
            return <div className={`${baseClasses} bg-yellow-500 animate-pulse`} title="Đang kiểm tra..."></div>;
        default:
            return <div className={`${baseClasses} bg-gray-500`} title="Chưa kiểm tra"></div>;
    }
};

export const ApiKeyDashboard: React.FC<ApiKeyDashboardProps> = ({ initialKeys, onKeysChange, isDisabled }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [isGuideVisible, setIsGuideVisible] = useState(false);

  useEffect(() => {
    setKeys(currentKeys => {
      return initialKeys.map(ik => {
        const existingKey = currentKeys.find(ck => ck.value === ik);
        // FIX: Explicitly type the status to prevent TypeScript from widening it to 'string'.
        return existingKey || { value: ik, status: 'unknown' as KeyStatus };
      });
    });
  }, [initialKeys]);

  const handleValidateKey = useCallback(async (keyToValidate: string) => {
    if (!keyToValidate) return;
    setKeys(prev => prev.map(k => k.value === keyToValidate ? { ...k, status: 'checking' } : k));
    const result = await validateApiKey(keyToValidate);
    setKeys(prev => prev.map(k => 
        k.value === keyToValidate 
        ? { ...k, status: result.isValid ? 'valid' : 'invalid', error: result.error } 
        : k
    ));
  }, []);

  const handleValidateAllKeys = useCallback(() => {
    keys.forEach(k => handleValidateKey(k.value));
  }, [keys, handleValidateKey]);

  useEffect(() => {
    if (initialKeys.length > 0) {
      handleValidateAllKeys();
    }
  }, []);

  const handleAddKey = () => {
    const trimmedKey = newKey.trim();
    if (trimmedKey && !keys.some(k => k.value === trimmedKey)) {
      // FIX: Explicitly type the status to prevent TypeScript from widening it to 'string'.
      const updatedKeys = [...keys, { value: trimmedKey, status: 'unknown' as KeyStatus }];
      setKeys(updatedKeys);
      onKeysChange(updatedKeys.map(k => k.value));
      handleValidateKey(trimmedKey);
      setNewKey('');
    }
  };
  
  const handleRemoveKey = (keyToRemove: string) => {
    const updatedKeys = keys.filter(k => k.value !== keyToRemove);
    setKeys(updatedKeys);
    onKeysChange(updatedKeys.map(k => k.value));
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-indigo-500/50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">Bảng điều khiển API Key</h2>
          <p className="text-sm text-gray-400">Thêm và quản lý các API Key Google Cloud của bạn.</p>
        </div>
        <button onClick={handleValidateAllKeys} className="text-xs text-gray-400 hover:text-white flex items-center space-x-1" disabled={isDisabled}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
            <span>Kiểm tra tất cả</span>
        </button>
      </div>

      <div className="flex space-x-2">
        <input
          type="password"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Dán API Key của bạn vào đây"
          disabled={isDisabled}
          className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          onClick={handleAddKey}
          disabled={!newKey.trim() || isDisabled}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 text-white font-bold py-2 px-4 rounded-lg"
        >
          Thêm
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {keys.length > 0 ? (
              keys.map(({ value, status, error }) => (
                  <div key={value} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg group">
                      <div className="flex items-center space-x-3">
                         <StatusIndicator status={status} error={error} />
                         <span className="font-mono text-sm text-gray-300">{maskApiKey(value)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                          <button onClick={() => !isDisabled && handleValidateKey(value)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-20" title="Kiểm tra lại" disabled={isDisabled}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                          </button>
                          <button onClick={() => !isDisabled && handleRemoveKey(value)} className="text-red-400 hover:text-red-300 text-xs font-bold disabled:opacity-20" disabled={isDisabled}>
                              XÓA
                          </button>
                      </div>
                  </div>
              ))
          ) : (
              <p className="text-center text-gray-500 text-sm py-4">Chưa có API Key nào. Vui lòng thêm một key để bắt đầu.</p>
          )}
      </div>

      <div>
          <button onClick={() => setIsGuideVisible(!isGuideVisible)} className="text-sm text-indigo-400 hover:text-indigo-300">
               {isGuideVisible ? '▲ Ẩn Hướng dẫn' : '▼ Làm thế nào để lấy API Key?'}
          </button>
      </div>

      {isGuideVisible && (
          <div className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg space-y-3 max-h-60 overflow-y-auto">
              <p className="font-bold text-white">Làm theo các bước sau để lấy API Key của bạn:</p>
              <ol className="list-decimal list-inside space-y-2">
                  <li><strong>Tạo/chọn dự án:</strong> Tới <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Google Cloud Console</a> và chọn một dự án.</li>
                  <li><strong>Kích hoạt API:</strong> Tới <a href="https://console.cloud.google.com/apis/library/vertexai.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Thư viện Vertex AI API</a>, đảm bảo bạn đang ở đúng dự án, và nhấn "Kích hoạt".</li>
                  <li><strong>Tạo Key:</strong> Tới trang <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Thông tin xác thực</a>, nhấn "+ TẠO THÔNG TIN XÁC THỰC" và chọn "Khóa API".</li>
                  <li><strong>(Khuyến khích) Bảo mật Key:</strong> Chỉnh sửa key mới, dưới "Hạn chế API", chọn "Hạn chế khóa" và chỉ cho phép "Vertex AI API".</li>
                  <li><strong>Sử dụng Key:</strong> Sao chép, dán vào ô bên trên và nhấn "Thêm".</li>
              </ol>
          </div>
      )}
    </div>
  );
};
