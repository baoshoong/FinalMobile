// API Configuration
// Tự động lấy IP từ Expo - không cần thay đổi thủ công!
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // Lấy IP từ Expo dev server (format: "192.168.x.x:8081")
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    // Tách IP từ debuggerHost (bỏ phần port 8081)
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3001`;
  }
  
  // Fallback cho production hoặc khi không detect được
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: In ra IP đang sử dụng
console.log('📡 API Base URL:', API_BASE_URL);

export default API_BASE_URL;
