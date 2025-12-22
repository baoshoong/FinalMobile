import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';import { SafeAreaView } from 'react-native-safe-area-context';import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/authSlice';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (!product.product_id || !product.product_name || !product.price) {
      Alert.alert('Lỗi', 'Thông tin sản phẩm không đầy đủ');
      return;
    }

    if (quantity > product.stock) {
      Alert.alert('Thông báo', 'Số lượng vượt quá tồn kho!');
      return;
    }

    dispatch(addToCart({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity
    }));

    Alert.alert(
      'Thành công',
      `Đã thêm ${quantity} ${product.product_name} vào giỏ hàng!`,
      [
        { text: 'Tiếp tục mua', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('CartScreen') }
      ]
    );
  };
  

  console.log('Product image URL:', product.image_url); // Debug: xem URL ảnh

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <Image 
        source={{ uri: product.image_url }} 
        style={styles.productImage}
        onError={(e) => {
          console.error('Image load error:', e.nativeEvent.error);
        }}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.product_name}</Text>
        <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')} ₫</Text>
        
        <View style={styles.stockContainer}>
          <FontAwesome5 name="box" size={16} color="#666" />
          <Text style={styles.productStock}>Còn {product.stock} sản phẩm</Text>
        </View>
        
        {product.product_description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Mô tả sản phẩm:</Text>
            <Text style={styles.productDescription}>{product.product_description}</Text>
          </View>
        )}

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            >
              <FontAwesome5 name="minus" size={16} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity < product.stock ? quantity + 1 : product.stock)}
            >
              <FontAwesome5 name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <FontAwesome5 name="cart-plus" size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff4d4d',
    marginBottom: 15,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  quantityButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 3,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
