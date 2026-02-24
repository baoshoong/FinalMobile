import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import ThankYouScreen from '../screens/Customer/ThankYouScreen';
import ProductManagementScreen from '../screens/Admin/ProductManagementScreen';
import CategoryManagementScreen from '../screens/Admin/CategoryManagementScreen';
import AddProductScreen from '../screens/Admin/AddProductScreen';
import EditProductScreen from '../screens/Admin/EditProductScreen';
import OrderManagementScreen from '../screens/Admin/OrderManagementScreen';
import AdminStatisticsScreen from '../screens/Admin/AdminStatisticsScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator(); // Sử dụng createNativeStackNavigator

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}> 
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ThankYou" component={ThankYouScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
      <Stack.Screen name="AdminStatistics" component={AdminStatisticsScreen} />
      <Stack.Screen name="BottomTabs" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
