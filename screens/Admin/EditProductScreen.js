import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const EditProductScreen = ({ route, navigation }) => {
  const { product } = route.params;

  const [name, setName] = useState(product.product_name); 
  const [description, setDescription] = useState(product.product_description || '');
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [image, setImage] = useState(product.image_url);
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    try {
      console.log('Requesting media library permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh!');
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        const filename = result.assets[0].uri.split('/').pop();
        setImage(filename);
        console.log('Image selected:', filename);
      } else {
        console.log('Image selection canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + error.message);
    }
  };

  // Helper function để kiểm tra xem có phải full URL không
  const isFullUrl = (str) => {
    return str && (str.startsWith('http://') || str.startsWith('https://'));
  };

  // Helper function để lấy MIME type từ file extension
  const getMimeType = (filename) => {
    if (!filename) return 'image/jpeg'; // Default
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  };

  const handleSave = async () => {
    try {
      let finalImageFilename = image;

      // Nếu đã chọn ảnh mới từ thư viện, upload lên server
      if (imageUri) {
        Alert.alert('Đang upload', 'Đang tải ảnh lên server...');
        
        const filename = image || 'photo.jpg';
        const mimeType = getMimeType(filename);
        
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: mimeType,
          name: filename
        });

        console.log('📤 Uploading image:', {
          filename,
          mimeType,
          uri: imageUri
        });

        const uploadResponse = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.data.success) {
          finalImageFilename = uploadResponse.data.filename;
          console.log('✅ Image uploaded successfully:', finalImageFilename);
        } else {
          throw new Error('Upload failed');
        }
      }

      // Sau khi upload xong (hoặc nếu giữ nguyên ảnh cũ), cập nhật sản phẩm
      await axios.put(`${API_BASE_URL}/products/${product.product_id}`, {
        product_name: name,
        product_description: description,
        price: parseInt(price, 10),
        stock: parseInt(stock, 10),
        image_url: finalImageFilename,
        category_id: product.category_id
      });
      
      Alert.alert('Thành công', 'Sản phẩm đã được cập nhật!');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      Alert.alert('Lỗi', error.response?.data?.error || error.message || 'Không thể lưu sản phẩm');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${product.product_id}`);
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.title}>CHỈNH SỬA SẢN PHẨM</Text>

      <Text style={styles.label}>Tên sản phẩm</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Mô tả sản phẩm</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={description} 
        onChangeText={setDescription}
        placeholder="Nhập mô tả sản phẩm"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Giá</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>Hàng tồn kho</Text>
      <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />

      <Text style={styles.label}>Hình ảnh</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <View style={styles.changeOverlay}>
              <Text style={styles.changeText}>Nhấn để thay đổi</Text>
            </View>
          </View>
        ) : image && (isFullUrl(image) || product.image_url) ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: isFullUrl(image) ? image : product.image_url }} 
              style={styles.imagePreview} 
              onError={(e) => {
                console.error('Image load error:', e.nativeEvent.error);
              }}
            />
            <View style={styles.changeOverlay}>
              <Text style={styles.changeText}>Nhấn để thay đổi</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.imagePickerText}>Chọn ảnh từ thư viện</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.label}>URL hoặc Tên file ảnh</Text>
      <TextInput 
        style={[styles.input, styles.urlInput]} 
        value={image} 
        onChangeText={setImage} 
        placeholder="Nhập URL đầy đủ hoặc tên file (vd: http://... hoặc image.jpg)"
        multiline
        numberOfLines={2}
      />
      <Text style={styles.helperText}>💡 Bạn có thể nhập URL đầy đủ (http://...) hoặc chỉ tên file</Text>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Xóa sản phẩm</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 8,
    fontWeight: '600',
  },  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  urlInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: -10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePicker: {
    height: 200,
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f8ff',
  },
  imagePickerText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  changeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
