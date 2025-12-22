import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import API_BASE_URL from '../../config/api';

const CategoryManagementScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh mục');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/categories`, {
        category_name: newCategory,
        image_url: null // Có thể thêm tính năng upload ảnh category sau
      });
      
      console.log('Add category response:', response.data);
      
      Alert.alert('Thành công', 'Thêm danh mục thành công!');
      setNewCategory('');
      fetchCategories(); // Reload danh sách
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Lỗi', error.response?.data?.error || 'Không thể thêm danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa danh mục này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
              Alert.alert('Thành công', 'Xóa danh mục thành công!');
              fetchCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Lỗi', error.response?.data?.error || 'Không thể xóa danh mục');
            }
          }
        }
      ]
    );
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditName(category.category_name);
  };

  const handleSaveEdit = async () => {
    if (editName.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/categories/${editingCategory.category_id}`, {
        category_name: editName,
        image_url: editingCategory.image_url
      });
      
      Alert.alert('Thành công', 'Cập nhật danh mục thành công!');
      setEditingCategory(null);
      setEditName('');
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Lỗi', error.response?.data?.error || 'Không thể cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#007bff" />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.title}>QUẢN LÝ DANH MỤC</Text>
      
      {refreshing ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.category_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryText}>{item.category_name}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={() => handleEditCategory(item)} style={styles.editButton}>
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(item.category_id)} style={styles.deleteButton}>
                  <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
          }
        />
      )}

      {editingCategory && (
        <View style={styles.editSection}>
          <Text style={styles.editTitle}>Sửa danh mục</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên danh mục"
            value={editName}
            onChangeText={setEditName}
            editable={!loading}
          />
          <View style={styles.editButtonGroup}>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.addButtonDisabled]} 
              onPress={handleSaveEdit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancelEdit}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.addSection}>
        <Text style={styles.addCategoryTitle}>Thêm danh mục mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên danh mục"
          value={newCategory}
          onChangeText={setNewCategory}
          editable={!loading}
        />
        <TouchableOpacity 
          style={[styles.addButton, loading && styles.addButtonDisabled]} 
          onPress={handleAddCategory}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Thêm danh mục</Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f8f8f8' 
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
    marginTop: 20, 
    marginBottom: 16,
    color: '#333'
  },
  categoryItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: '#fff', 
    marginBottom: 8, 
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: { 
    fontSize: 16,
    color: '#333',
    flex: 1
  },
  deleteButton: { 
    backgroundColor: '#ff4d4d', 
    paddingHorizontal: 16,
    paddingVertical: 8, 
    borderRadius: 6 
  },
  deleteText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999'
  },
  addSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  addCategoryTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 12,
    color: '#007bff'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    padding: 12, 
    marginBottom: 12,
    fontSize: 16
  },
  editSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#856404',
  },
  editButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategoryManagementScreen;
