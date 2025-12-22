import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import API_BASE_URL from '../../config/api';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Could not fetch categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DANH MỤC SẢN PHẨM</Text>
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.category_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryItem}
              onPress={() => navigation.navigate('CustomerInterface', { 
                categoryId: item.category_id,
                categoryName: item.category_name 
              })}
            >
              <Text style={styles.categoryText}>{item.category_name}</Text>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.emptyMessage}>Không có danh mục nào để hiển thị.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  categoryItem: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  arrowText: {
    fontSize: 24,
    color: '#666',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CategoriesScreen;
