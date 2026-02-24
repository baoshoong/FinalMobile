import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Thống kê',
      icon: 'chart-line',
      color: '#007bff',
      screen: 'AdminStatistics',
      description: 'Xem báo cáo & số liệu'
    },
    {
      title: 'Quản lý đơn hàng',
      icon: 'clipboard-list',
      color: '#28a745',
      screen: 'OrderManagement',
      description: 'Xem & cập nhật đơn hàng'
    },
    {
      title: 'Quản lý sản phẩm',
      icon: 'box',
      color: '#17a2b8',
      screen: 'ProductManagement',
      description: 'Thêm, sửa, xóa sản phẩm'
    },
    {
      title: 'Quản lý danh mục',
      icon: 'tags',
      color: '#ffc107',
      screen: 'CategoryManagement',
      description: 'Quản lý danh mục sản phẩm'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="user-shield" size={60} color="#fff" />
        <Text style={styles.headerTitle}>QUẢN TRỊ ADMIN</Text>
        <Text style={styles.headerSubtitle}>Chào mừng bạn đến với trang quản trị</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <FontAwesome5 name={item.icon} size={28} color="#fff" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace('Login')}
      >
        <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#283593',
    padding: 40,
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFEB3B',
    marginTop: 5,
  },
  menuContainer: {
    padding: 15,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    margin: 15,
    padding: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;
