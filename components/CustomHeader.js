import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomHeader = ({ navigation }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => console.log('Danh mục')}>
        <Icon name="bars" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CustomerInterface')}>
        <Icon name="home" size={24} color="#fff" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
        <Icon name="shopping-basket" size={24} color="#fff" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Đăng xuất')}>
        <Icon name="user" size={24} color="#fff" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#6200ea',
    paddingVertical: 10,
  },
  icon: {
    marginHorizontal: 15,
  },
});

export default CustomHeader;
