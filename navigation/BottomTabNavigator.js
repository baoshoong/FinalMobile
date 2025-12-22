import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CategoriesScreen from '../screens/Customer/CategoriesScreen';
import CustomerInterfaceScreen from '../screens/Customer/CustomerInterfaceScreen';
import CartScreen from '../screens/Customer/CartScreen';
import CheckoutScreen from '../screens/Customer/CheckoutScreen';
import ProductDetailScreen from '../screens/Customer/ProductDetailScreen';
import OrderHistoryScreen from '../screens/Customer/OrderHistoryScreen';
import LoginScreen from '../screens/Auth/LoginScreen';

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
    const navigation = useNavigation();
    return (
        <Tab.Navigator
            initialRouteName="CustomerInterface"
            screenOptions={{
                tabBarStyle: { backgroundColor: '#283593' },
                tabBarActiveTintColor: '#FFEB3B',
                tabBarInactiveTintColor: '#FAFAFA',
                headerShown: false,
            }}
        >
            {/* Chi tiết sản phẩm */}
            <Tab.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{
                    tabBarButton: () => null,
                }}
            />

            {/* Danh mục */}
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarLabel: 'Danh mục',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="bars" size={size} color={color} />
                    ),
                }}
            />

            {/* Trang chủ */}
            <Tab.Screen
                name="CustomerInterface"
                component={CustomerInterfaceScreen}
                options={{
                    tabBarLabel: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Giỏ hàng */}
            <Tab.Screen
                name="CartScreen"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Giỏ hàng',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="shopping-cart" size={size} color={color} />
                    ),
                }}
            />

            {/* Đơn hàng */}
            <Tab.Screen
                name="OrderHistory"
                component={OrderHistoryScreen}
                options={{
                    tabBarLabel: 'Đơn hàng',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="receipt" size={size} color={color} />
                    ),
                }}
            />

            {/* Đăng xuất */}
            <Tab.Screen
        name="Logout"
        component={() => null}
        options={{
          tabBarLabel: 'Đăng xuất',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="sign-out-alt" size={size} color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                navigation.replace('Login'); // Chuyển hướng đến Login
              }}
            />
          ),
        }}
      />


            {/* Thanh toán */}
            <Tab.Screen
                name="CheckoutScreen"
                component={CheckoutScreen}
                options={{
                    tabBarButton: () => null,
                }}
            />

        </Tab.Navigator>
    );
}

export default BottomTabNavigator;
