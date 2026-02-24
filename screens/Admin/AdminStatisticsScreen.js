import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const AdminStatisticsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
      </View>
    );
  }

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.mainTitle}>📊 THỐNG KÊ TỔNG QUAN</Text>

      {/* Thống kê sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 SẢN PHẨM</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statNumber}>{stats.products.total_products}</Text>
            <Text style={styles.statLabel}>Sản phẩm</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
            <Text style={styles.statNumber}>{stats.products.total_stock}</Text>
            <Text style={styles.statLabel}>Tồn kho</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={styles.statNumber}>{stats.categories.total_categories}</Text>
            <Text style={styles.statLabel}>Danh mục</Text>
          </View>
        </View>
      </View>

      {/* Thống kê người dùng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 NGƯỜI DÙNG</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={styles.statNumber}>{stats.users.total_users}</Text>
            <Text style={styles.statLabel}>Tổng số</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e0f2f1' }]}>
            <Text style={styles.statNumber}>{stats.users.total_customers}</Text>
            <Text style={styles.statLabel}>Khách hàng</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fce4ec' }]}>
            <Text style={styles.statNumber}>{stats.users.total_admins}</Text>
            <Text style={styles.statLabel}>Admin</Text>
          </View>
        </View>
      </View>

      {/* Thống kê đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛒 ĐƠN HÀNG</Text>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
          <Text style={styles.revenueAmount}>
            {parseFloat(stats.orders.total_revenue || 0).toLocaleString('vi-VN')} ₫
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Text style={styles.statNumber}>{stats.orders.total_orders}</Text>
            <Text style={styles.statLabel}>Tổng đơn</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
            <Text style={styles.statNumber}>
              {parseFloat(stats.orders.avg_order_value || 0).toLocaleString('vi-VN')} ₫
            </Text>
            <Text style={styles.statLabel}>TB/Đơn</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.subTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusBadge, { backgroundColor: '#ffc107' }]}>
                <Text style={styles.statusNumber}>{stats.orders.pending_orders}</Text>
              </View>
              <Text style={styles.statusText}>Chờ xác nhận</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusBadge, { backgroundColor: '#17a2b8' }]}>
                <Text style={styles.statusNumber}>{stats.orders.processing_orders}</Text>
              </View>
              <Text style={styles.statusText}>Đang xử lý</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusBadge, { backgroundColor: '#007bff' }]}>
                <Text style={styles.statusNumber}>{stats.orders.shipped_orders}</Text>
              </View>
              <Text style={styles.statusText}>Đang giao</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusBadge, { backgroundColor: '#28a745' }]}>
                <Text style={styles.statusNumber}>{stats.orders.delivered_orders}</Text>
              </View>
              <Text style={styles.statusText}>Đã giao</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusBadge, { backgroundColor: '#dc3545' }]}>
                <Text style={styles.statusNumber}>{stats.orders.cancelled_orders}</Text>
              </View>
              <Text style={styles.statusText}>Đã hủy</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sản phẩm tồn kho thấp */}
      {stats.low_stock_products && stats.low_stock_products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ TỒN KHO THẤP</Text>
          {stats.low_stock_products.map((product) => (
            <View key={product.product_id} style={styles.lowStockItem}>
              <Text style={styles.productName}>{product.product_name}</Text>
              <Text style={styles.stockWarning}>Còn {product.stock}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Top sản phẩm bán chạy */}
      {stats.top_products && stats.top_products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 TOP SẢN PHẨM BÁN CHẠY</Text>
          {stats.top_products.map((product, index) => (
            <View key={product.product_id} style={styles.topProductItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.product_name}</Text>
                <Text style={styles.productStats}>
                  Đã bán: {product.total_sold} | Doanh thu: {parseFloat(product.total_revenue).toLocaleString('vi-VN')} ₫
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Đơn hàng gần đây */}
      {stats.recent_orders && stats.recent_orders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 ĐỠN HÀNG GẦN ĐÂY</Text>
          {stats.recent_orders.map((order) => (
            <View key={order.order_id} style={styles.recentOrderItem}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.order_id}</Text>
                <Text style={styles.orderAmount}>
                  {parseFloat(order.total_amount).toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              <Text style={styles.orderCustomer}>
                {order.username || order.customer_name}
              </Text>
              <Text style={styles.orderDate}>
                {new Date(order.order_date).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('OrderManagement')}
          >
            <Text style={styles.viewAllText}>Xem tất cả đơn hàng →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    color: '#333',
    elevation: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#555',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  revenueCard: {
    backgroundColor: '#28a745',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    marginTop: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusItem: {
    alignItems: 'center',
    width: '30%',
  },
  statusBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  stockWarning: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  topProductItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  productInfo: {
    flex: 1,
  },
  productStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentOrderItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  orderCustomer: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AdminStatisticsScreen;
