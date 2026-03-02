import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../config/api';
import * as FileSystem from 'expo-file-system';

/**
 * SmartImage Component - Tự động xử lý hình ảnh khi đổi mạng
 * 
 * Features:
 * - Xây dựng URL động từ API_BASE_URL hiện tại
 * - Cache hình ảnh vào local storage
 * - Auto retry khi load fail
 * - Fallback placeholder
 * - Hoạt động offline với cached images
 */
const SmartImage = ({ 
  imageUrl, 
  style, 
  productName = '',
  placeholderIcon = 'image',
  placeholderText = 'Không có ảnh',
  showLoading = false
}) => {
  const [imageState, setImageState] = useState({
    uri: null,
    loading: true,
    error: false,
    retryCount: 0
  });

  // Xây dựng URL động từ API_BASE_URL hiện tại
  const buildImageUrl = (url) => {
    if (!url) return null;
    
    // Nếu đã là full URL, chỉ thay thế IP cũ bằng IP mới
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Tách lấy phần filename
      const filename = url.split('/images/').pop();
      if (filename && !filename.includes('http')) {
        // Build lại URL với API_BASE_URL hiện tại
        return `${API_BASE_URL}/images/${filename}`;
      }
      return url;
    }
    
    // Nếu chỉ là filename, build full URL
    return `${API_BASE_URL}/images/${url}`;
  };

  // Cache key từ filename
  const getCacheKey = (url) => {
    if (!url) return null;
    const filename = url.split('/').pop();
    return `${FileSystem.cacheDirectory}${filename}`;
  };

  // Load image với cache
  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        const dynamicUrl = buildImageUrl(imageUrl);
        
        if (!dynamicUrl) {
          if (mounted) {
            setImageState({ uri: null, loading: false, error: true, retryCount: 0 });
          }
          return;
        }

        // Check cache trước
        const cacheKey = getCacheKey(dynamicUrl);
        if (cacheKey) {
          const cacheInfo = await FileSystem.getInfoAsync(cacheKey);
          
          if (cacheInfo.exists) {
            console.log('✅ Loaded from cache:', productName);
            if (mounted) {
              setImageState({ 
                uri: cacheInfo.uri, 
                loading: false, 
                error: false, 
                retryCount: 0 
              });
            }
            return;
          }
        }

        // Load từ network và cache lại
        console.log('🌐 Loading from network:', productName, dynamicUrl);
        
        // Thử load trực tiếp trước
        if (mounted) {
          setImageState(prev => ({ 
            ...prev, 
            uri: dynamicUrl, 
            loading: false 
          }));
        }

        // Download về cache để dùng lần sau
        if (cacheKey) {
          try {
            const downloadResumable = FileSystem.createDownloadResumable(
              dynamicUrl,
              cacheKey
            );
            
            await downloadResumable.downloadAsync();
            console.log('💾 Cached successfully:', productName);
          } catch (downloadError) {
            console.log('⚠️  Cache failed (still showing image):', downloadError.message);
          }
        }

      } catch (error) {
        console.error('❌ Image load error:', productName, error.message);
        if (mounted) {
          setImageState(prev => ({ 
            ...prev, 
            loading: false, 
            error: true 
          }));
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [imageUrl, API_BASE_URL]);

  // Retry mechanism
  const handleRetry = () => {
    if (imageState.retryCount < 3) {
      console.log(`🔄 Retry ${imageState.retryCount + 1}/3:`, productName);
      setImageState(prev => ({
        ...prev,
        loading: true,
        error: false,
        retryCount: prev.retryCount + 1
      }));
      
      // Trigger reload
      const dynamicUrl = buildImageUrl(imageUrl);
      setImageState(prev => ({
        ...prev,
        uri: dynamicUrl,
        loading: false
      }));
    }
  };

  // Loading state
  if (imageState.loading && showLoading) {
    return (
      <View style={[styles.placeholderContainer, style]}>
        <ActivityIndicator size="small" color="#283593" />
        <Text style={styles.placeholderText}>Đang tải...</Text>
      </View>
    );
  }

  // Error state - show placeholder
  if (imageState.error || !imageState.uri) {
    return (
      <View style={[styles.placeholderContainer, style]}>
        <FontAwesome5 name={placeholderIcon} size={40} color="#999" />
        <Text style={styles.placeholderText}>{placeholderText}</Text>
      </View>
    );
  }

  // Success state - show image
  return (
    <Image
      source={{ uri: imageState.uri }}
      style={style}
      onError={(e) => {
        console.error(`❌ Image render error: ${productName}`);
        console.error('   URL:', imageState.uri);
        handleRetry();
      }}
    />
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SmartImage;
