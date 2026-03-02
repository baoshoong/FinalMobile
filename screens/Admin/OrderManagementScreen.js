import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const OrderManagementScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/orders?role=admin`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = (orderId, currentStatus) => {
    const statuses = [
      { value: 'pending', label: 'Chờ xác nhận' },
      { value: 'processing', label: 'Đang xử lý' },
      { value: 'shipped', label: 'Đang giao' },
      { value: 'delivered', label: 'Đã giao' },
      { value: 'cancelled', label: 'Đã hủy' }
    ];

    Alert.alert(
      'Cập nhật trạng thái',
      'Chọn trạng thái mới',
      statuses.map(status => ({
        text: status.label,
        onPress: async () => {
          if (status.value === currentStatus) return;
          
          try {
            await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
              status: status.value
            });
            Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
            fetchOrders();
          } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
          }
        }
      })),
      { cancelable: true }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.order_id}</Text>
          <Text style={styles.username}>👤 {item.username || item.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          📅 {new Date(item.order_date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.orderTotal}>💰 {item.total_amount.toLocaleString('vi-VN')} ₫</Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.infoText}>📞 {item.customer_phone}</Text>
        <Text style={styles.infoText} numberOfLines={2}>📍 {item.customer_address}</Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('OrderDetail', { order_id: item.order_id })}
        >
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statusButton}
          onPress={() => handleUpdateStatus(item.order_id, item.status)}
        >
          <Text style={styles.statusButtonText}>Đổi trạng thái</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUẢN LÝ ĐƠN HÀNG</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
            style={styles.picker}
          >
            <Picker.Item label="Tất cả" value="all" />
            <Picker.Item label="Chờ xác nhận" value="pending" />
            <Picker.Item label="Đang xử lý" value="processing" />
            <Picker.Item label="Đang giao" value="shipped" />
            <Picker.Item label="Đã giao" value="delivered" />
            <Picker.Item label="Đã hủy" value="cancelled" />
          </Picker>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng: {filteredOrders.length} đơn | 
          Doanh thu: {filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toLocaleString('vi-VN')} ₫
        </Text>
      </View>
      
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.order_id.toString()}
        renderItem={renderOrder}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📦</Text>
            <Text style={styles.emptyMessage}>Không có đơn hàng nào</Text>
          </View>
        }
      />
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
    backgroundColor: '#f5f5f5'
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden'
  },
  picker: {
    height: 40,
  },
  statsContainer: {
    backgroundColor: '#007bff',
    padding: 12,
    marginBottom: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  orderCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 2
  },
  username: {
    fontSize: 14,
    color: '#666'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11
  },
  orderInfo: {
    marginBottom: 8
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4d4d'
  },
  customerInfo: {
    marginBottom: 10
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyMessage: {
    fontSize: 16,
    color: '#999'
  }
});

export default OrderManagementScreen;
