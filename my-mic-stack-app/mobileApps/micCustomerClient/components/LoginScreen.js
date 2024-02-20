import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios'; // You can use Axios for making HTTP requests

const LoginScreen = () => {
  const [phone, setPhone] = useState('');

  const handleSendOTP = async () => {
    try {
      // Make a POST request to send OTP
      const response = await axios.post('http://localhost:3000/user/login', { phone });

      // Check response status
      if (response.status === 200) {
        // OTP sent successfully
        Alert.alert('Success', 'OTP sent to your phone number');
      } else {
        // Handle other status codes
        Alert.alert('Error', 'Failed to send OTP');
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error:', error);
      Alert.alert('Error', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Enter your mobile number</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', width: 200, padding: 10, marginBottom: 10 }}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(text)}
      />
      <Button title="Send OTP" onPress={handleSendOTP} />
    </View>
  );
};

export default LoginScreen;
