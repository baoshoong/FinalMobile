import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartQuantity } from '../../redux/slices/authSlice';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.auth.cart || []);

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          onPress: () => dispatch(removeFromCart(productId)),
          style: 'destructive'
        }
      ]
    );
  };

  const handleUpdateQuantity = (productId, delta) => {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    dispatch(updateCartQuantity({ product_id: productId, quantity: newQuantity }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  };

  const checkout = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống, không thể thanh toán.');
      return;
    }
    navigation.navigate('CheckoutScreen');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.productImage}
        defaultSource={require('../../assets/icon.png')}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product_name || 'Sản phẩm không xác định'}</Text>
        <Text style={styles.productPrice}>{(item.price || 0).toLocaleString('vi-VN')} ₫</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.product_id, -1)}
          >
            <FontAwesome5 name="minus" size={14} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity || 0}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.product_id, 1)}
          >
            <FontAwesome5 name="plus" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtotal}>
          Tổng: {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} ₫
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveItem(item.product_id)}
      >
        <FontAwesome5 name="trash" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="shopping-cart" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('CustomerInterface')}
        >
          <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>      <Text style={styles.title}>GIỎ HÀNG CỦA BẠN</Text>
      
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product_id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
      />
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>{calculateTotal().toLocaleString('vi-VN')} ₫</Text>
        </View>
        
        <TouchableOpacity style={styles.checkoutButton} onPress={checkout}>
          <FontAwesome5 name="credit-card" size={18} color="#fff" />
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    color: '#333',
    elevation: 2,
  },
  listContainer: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#007bff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
    color: '#333',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 15,
    elevation: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4d',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;
