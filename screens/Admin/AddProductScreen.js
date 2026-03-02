import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].category_id); 
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        Alert.alert('Lỗi', 'Không thể tải danh mục sản phẩm.');
      }
    };

    fetchCategories();
  }, []);

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
        // Lấy tên file từ URI
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

  const handleAddProduct = async () => {
    if (!name || !price || !stock || !selectedCategory) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin sản phẩm.');
      return;
    }

    if (!imageUri && !image) {
      Alert.alert('Thông báo', 'Vui lòng chọn ảnh hoặc nhập tên file ảnh');
      return;
    }

    try {
      let finalImageFilename = image;

      // Nếu đã chọn ảnh từ thư viện, upload lên server
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

      // Sau khi upload xong (hoặc nếu nhập tay), lưu sản phẩm
      const response = await axios.post(`${API_BASE_URL}/products`, {
        product_name: name,
        product_description: description || 'Chưa có mô tả',
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image_url: finalImageFilename,
        category_id: parseInt(selectedCategory),
      });
      
      Alert.alert('Thành công', 'Sản phẩm đã được thêm!');
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImage('');
      setImageUri(null);
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      Alert.alert('Lỗi', error.response?.data?.error || error.message || 'Không thể thêm sản phẩm, vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>THÊM SẢN PHẨM MỚI</Text>

        <Text style={styles.label}>Tên sản phẩm</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên sản phẩm"
          returnKeyType="next"
        />

        <Text style={styles.label}>Mô tả sản phẩm</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Nhập mô tả sản phẩm (tùy chọn)"
          multiline
          numberOfLines={4}
          returnKeyType="next"
        />

        <Text style={styles.label}>Giá</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Nhập giá sản phẩm"
          returnKeyType="next"
        />

        <Text style={styles.label}>Hàng tồn kho</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          keyboardType="numeric"
          placeholder="Nhập số lượng"
          returnKeyType="done"
        />

        <Text style={styles.label}>Hình ảnh</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <View style={styles.changeOverlay}>
                <Text style={styles.changeText}>Nhấn để thay đổi</Text>
              </View>
            </View>
          ) : image && isFullUrl(image) ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: image }} 
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
          placeholder="Nhập URL đầy đủ (http://...) hoặc tên file (product.jpg)"
          returnKeyType="done"
          multiline
          numberOfLines={2}
        />
        <Text style={styles.helperText}>💡 Bạn có thể nhập URL đầy đủ hoặc chỉ tên file</Text>

        <Text style={styles.label}>Danh mục</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {categories.map((category) => (
              <Picker.Item
                key={category.category_id}
                label={category.category_name}
                value={category.category_id}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Thêm sản phẩm" onPress={handleAddProduct} />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
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
  },
  title: {
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
    marginTop: 10,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 15,
  },  textArea: {
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
    marginTop: -5,
    marginBottom: 15,
    paddingHorizontal: 5,
  },  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
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

export default AddProductScreen;
