import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import axios from 'axios';

const OrderScreen = ({ navigation }) => {
  // State variables to store pickup time, delivery time, and other order details
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Function to handle order submission
  const handleSubmitOrder = async () => {
    try {
      // Make a POST request to your backend API to submit the order
      const response = await axios.post('http://your-backend-url/submit-order', {
        pickupTime,
        deliveryTime,
        // Add other order details as needed
      });

      // Check if the order was successfully submitted
      if (response.status === 200) {
        // Show success message
        Alert.alert('Success', 'Order submitted successfully');
        
        // Optionally, navigate to a different screen after submitting the order
        navigation.navigate('OrderList');
      } else {
        // Show error message if order submission fails
        Alert.alert('Error', 'Failed to submit order');
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error submitting order:', error);
      Alert.alert('Error', 'Failed to submit order');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Enter Pickup Time</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', width: 200, padding: 10, marginBottom: 10 }}
        placeholder="Pickup Time"
        value={pickupTime}
        onChangeText={setPickupTime}
      />
      <Text>Enter Delivery Time</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', width: 200, padding: 10, marginBottom: 10 }}
        placeholder="Delivery Time"
        value={deliveryTime}
        onChangeText={setDeliveryTime}
      />
      <Button title="Submit Order" onPress={handleSubmitOrder} />
    </View>
  );
};

export default OrderDetails;
