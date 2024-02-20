import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

function RegisterScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState('');

  const handleSendOTP = async () => {
    console.log("handleSendOTP");
    try {
      console.log("try");
  
      const response = await fetch('http://localhost:3000/user/register', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: mobileNumber }),
      });
      console.log(response);
  
      const data = await response.json();
  
      if (response.ok) {
        // Check if the mobile number is already registered
        if (data.isRegistered) {
          // Mobile number is already registered, navigate to login screen
          navigation.navigate('Login');
        } else {
          // Mobile number is not registered, navigate to OTP verification screen
          navigation.navigate('OTPVerification', { mobileNumber });
        }
      } else {
        // Registration failed, show error message
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error:', error);
      Alert.alert('Error', error);
    }
  };
  

  return (
    <View>
      <Text>Register with Mobile Number</Text>
      <TextInput
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={(text) => setMobileNumber(text)}
      />
      <Button title="Send OTP" onPress={handleSendOTP} />
    </View>
  );
}

export default RegisterScreen;
