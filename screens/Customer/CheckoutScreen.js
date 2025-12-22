import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { clearCart } from '../../redux/slices/authSlice';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const CheckoutScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.auth.cart || []);
  const user = useSelector((state) => state.auth.user);

  // Tự động điền thông tin từ user khi component mount
  useEffect(() => {
    if (user) {
      if (user.full_name) setName(user.full_name);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
    }
  }, [user]);
  
  // Tính tổng tiền
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleConfirmOrder = async () => {
    if (!name.trim() || !address.trim() || !phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống!');
      return;
    }

    if (!user || !user.user_id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng!');
      navigation.navigate('Login');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        user_id: user.user_id,
        total_amount: totalAmount,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        notes: notes,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          image_url: item.image_url,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      
      if (response.data.order_id) {
        // Xóa giỏ hàng sau khi đặt hàng thành công
        dispatch(clearCart());
        
        Alert.alert(
          'Thành công!',
          'Đơn hàng của bạn đã được đặt thành công!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ThankYou', { order_id: response.data.order_id })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.error || 'Không thể tạo đơn hàng. Vui lòng thử lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>      <Text style={styles.title}>THÔNG TIN GIAO HÀNG</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName}
          placeholder="Nhập họ và tên"
          editable={!loading}
        />

        <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
        <TextInput 
          style={styles.input} 
          value={phone} 
          onChangeText={setPhone} 
          keyboardType="phone-pad"
          placeholder="Nhập số điện thoại"
          editable={!loading}
        />

        <Text style={styles.label}>Địa chỉ <Text style={styles.required}>*</Text></Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={address} 
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ giao hàng"
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        <Text style={styles.label}>Ghi chú</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={notes} 
          onChangeText={setNotes}
          placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>THÔNG TIN ĐƠN HÀNG</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số sản phẩm:</Text>
          <Text style={styles.summaryValue}>{cart.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
          <Text style={styles.summaryValue}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{totalAmount.toLocaleString('vi-VN')} ₫</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
        onPress={handleConfirmOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>XÁC NHẬN ĐẶT HÀNG</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
    backgroundColor: '#f5f5f5'
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
    marginVertical: 20,
    color: '#333'
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8,
    color: '#333',
    fontWeight: '600'
  },
  required: {
    color: '#ff4d4d'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginBottom: 16, 
    padding: 12, 
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007bff'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666'
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#007bff'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4d'
  },
  confirmButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc'
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CheckoutScreen;
