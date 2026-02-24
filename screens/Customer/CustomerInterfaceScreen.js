import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const CustomerInterfaceScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/products`)
      .then((response) => {
        let filteredProducts = response.data;
        
        // Lọc theo category nếu có
        if (categoryId) {
          filteredProducts = response.data.filter(
            product => product.category_id === categoryId
          );
        }
        
        setProducts(filteredProducts);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, [categoryId]);

  const renderProduct = ({ item }) => {
    console.log('Image URL:', item.image_url); // Debug: xem URL ảnh
    console.log('Price:', item.price, 'Formatted:', item.price.toLocaleString('vi-VN')); // Debug: xem giá
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.productImage}
          onError={(e) => {
            console.error('Image load error:', e.nativeEvent.error);
            Alert.alert('Lỗi ảnh', `Không thể tải ảnh: ${item.product_name}\nURL: ${item.image_url}`);
          }}
        />
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>Giá: {item.price.toLocaleString('vi-VN')} ₫</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#283593" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {categoryName ? categoryName : 'E-commerce shop'}
      </Text>
      {categoryName && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('CustomerInterface')}
        >
          <Text style={styles.backButtonText}>← Xem tất cả sản phẩm</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.product_id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#283593',
    paddingVertical: 10,
  },
  productList: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 16,
    color: '#283593',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#283593',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomerInterfaceScreen;
