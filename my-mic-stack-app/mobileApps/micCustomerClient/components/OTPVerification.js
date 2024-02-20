import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';

function OTPVerification({ route, navigation }) {
  const { mobileNumber } = 919003249959;
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: mobileNumber, verificationCode }),
      });

      if (response.ok) {
        navigation.navigate('Home'); // Redirect to Home screen after successful OTP verification
      } else {
        const errorMessage = await response.text();
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View>
      <Text>Enter the OTP sent to {mobileNumber}</Text>
      <TextInput
        placeholder="OTP"
        keyboardType="numeric"
        value={verificationCode}
        onChangeText={(text) => setVerificationCode(text)}
      />
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
    </View>
  );
}

export default OTPVerification;
