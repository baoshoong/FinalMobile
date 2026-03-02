// API Configuration
// Tự động lấy IP từ Expo - không cần thay đổi thủ công!
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // ====== DEVELOPMENT - Expo Dev Server ======
  // Lấy IP từ Expo dev server (format: "192.168.x.x:8081")
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    // Tách IP từ debuggerHost (bỏ phần port 8081)
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3001`;
  }
  
  // ====== PRODUCTION - Environment Variable ======
  // Dùng biến môi trường nếu có (cho production APK)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // ====== FALLBACK ======
  // Mặc định cho localhost dev
  const fallbackUrl = 'http://localhost:3001';
  console.warn('⚠️  No API server detected. Using fallback:', fallbackUrl);
  console.warn('    For production: Set API_BASE_URL environment variable or expo env');
  return fallbackUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: In ra IP đang sử dụng
console.log('📡 API Base URL:', API_BASE_URL);

export default API_BASE_URL;
