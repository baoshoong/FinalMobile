import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ThankYouScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cảm ơn bạn đã mua sắm!</Text>
      <Button
        title="Quay lại trang chủ"
        onPress={() => navigation.navigate('BottomTabs', { screen: 'CustomerInterface' })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});

export default ThankYouScreen;
