import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentUser, setUser } from '../../redux/slices/authSlice';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: username,
        password: password
      });

      if (response.data.user) {
        const user = response.data.user;
        
        // Lưu thông tin user vào Redux
        dispatch(setCurrentUser(user));
        dispatch(setUser(user));
        
        // Điều hướng theo role
        if (user.role === 'admin') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('BottomTabs');
        }
        
        Alert.alert('Thành công', `Chào mừng ${user.username}!`);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Đăng nhập thất bại',
        error.response?.data?.error || 'Tên đăng nhập hoặc mật khẩu không đúng!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
        Đăng ký!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  loginButton: {
    backgroundColor: '#283593',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  registerText: {
    color: 'blue',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;