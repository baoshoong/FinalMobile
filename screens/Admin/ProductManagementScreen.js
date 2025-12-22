import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const ProductManagementScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);

  // Note: This only runs once on mount. If you want it to reload when you come back 
  // from "EditProduct", you might need to use useFocusEffect or a navigation listener.
  useEffect(() => {
    fetchProducts();
    
    // Optional: Add a listener to refresh data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProducts = async () => {
    try {
      // Ensure this IP matches your computer's local IP
      const response = await axios.get(`${API_BASE_URL}/products?showHidden=true`); 
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.');
    }
  };

  const handleToggleVisibility = async (productId, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/products/${productId}/visibility`, {
        is_hidden: !currentStatus,
      });
      
      Alert.alert('Thành công', currentStatus ? 'Đã hiển thị sản phẩm' : 'Đã ẩn sản phẩm');
      fetchProducts(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái sản phẩm');
    }
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const renderProductItem = ({ item }) => (
    <View style={[styles.productCard, item.is_hidden && styles.hiddenProduct]}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.productImage}
        onError={() => Alert.alert('Lỗi ảnh', `Không thể tải ảnh: ${item.product_name}`)}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>
          {item.product_name || 'Tên sản phẩm không có sẵn'} {item.is_hidden && '(Đã ẩn)'}
        </Text>
        <Text style={styles.productPrice}>{`Giá: ${item.price ? item.price.toLocaleString('vi-VN') : 'N/A'} ₫`}</Text>
        <Text style={[styles.productStock, item.stock > 0 ? styles.inStock : styles.outOfStock]}>
          {item.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
        </Text>
        <View style={styles.visibilityContainer}>
          <Text style={styles.visibilityLabel}>
            {item.is_hidden ? 'Đang ẩn' : 'Hiển thị'}
          </Text>
          <Switch
            value={!item.is_hidden}
            onValueChange={() => handleToggleVisibility(item.product_id, item.is_hidden)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={!item.is_hidden ? '#4CAF50' : '#f44336'}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEditProduct(item)}>
        <Text style={styles.editButtonText}>Sửa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUẢN LÝ SẢN PHẨM</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>

        {products.length === 0 ? (
          <Text style={styles.noProductsText}>Không có sản phẩm nào để hiển thị.</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderProductItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
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
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  hiddenProduct: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
  },
  productStock: {
    fontSize: 14,
    marginTop: 4,
  },
  inStock: {
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#f44336',
  },
  visibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  visibilityLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
    marginTop: 20,
  },
});

export default ProductManagementScreen;