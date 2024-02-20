import React from 'react';
import {Text, View, Button,ScrollView} from 'react-native';

function HomeScreen({navigation}){
    
  const handleLogin = () => {
    // Here, you can handle user login logic.
    // For this example, we'll simply navigate to a dashboard or home screen.
    navigation.navigate('Login');
  };
  const handleRegister = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Register');
  };
  const handleCardDetails = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('CardDetails');
  };
  const handleOrders = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Orders');
  };
  const handleMessaging = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Messaging');
  };
  const handleSizes = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Sizes');
  };
  const handlePricelist = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Pricelist');
  };
  const handleOrderDetails = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('OrderDetails');
  };
  const handleNotifications = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Notifications');
  };
  const handleVerification = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Verification');
  };
  const handleLocation = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Location');
  };
  const handleMobileNumber = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('MobileNumber');
  };
  const handleSelectDress = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('SelectDress');
  };
  const handlePaymentConfirm = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('PaymentConfirm');
  };
  const handleOrderSummary = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('OrderSummary');
  };
  const handleScheduling = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Scheduling');
  };
  const handleOrderPlaced = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('OrderPlaced');
  };
  const handlelanding = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('Landing');
  };
  const handleOTPverification = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('OTPverification');
  };
  const handletest = () => {
    // Here, you can handle user registration logic.
    // For this example, we'll simply navigate to the login screen.
    navigation.navigate('test');
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ScrollView>
      <Text>this is home screen</Text>
      <Text>Register</Text>
      <Button title="Register" onPress={handleRegister} />
      
      <Text>Login</Text>
      <Button title="Login" onPress={handleLogin} />
      
      <Text>OTPverification</Text>
      <Button title="OTPverification" onPress={handleOTPverification} />
      
      <Text>CardDetails</Text>
      <Button title="CardDetails" onPress={handleCardDetails} />
      
      <Text>Orders</Text>
      <Button title="Orders" onPress={handleOrders} />
      
      <Text>Messaging</Text>
      <Button title="Messaging" onPress={handleMessaging} />
      
      <Text>Sizes</Text>
      <Button title="Sizes" onPress={handleSizes} />
      
      <Text>Pricelist</Text>
      <Button title="Pricelist" onPress={handlePricelist} />
      
      <Text>OrderDetails</Text>
      <Button title="OrderDetails" onPress={handleOrderDetails} />
      
      <Text>Notifications</Text>
      <Button title="Notifications" onPress={handleNotifications} />
      
      <Text>Verification</Text>
      <Button title="Verification" onPress={handleVerification} />
      
      <Text>Location</Text>
      <Button title="Location" onPress={handleLocation} />
      
      <Text>MobileNumber</Text>
      <Button title="MobileNumber" onPress={handleMobileNumber} />
      
      <Text>SelectDress</Text>
      <Button title="SelectDress" onPress={handleSelectDress} />
      
      <Text>PaymentConfirm</Text>
      <Button title="PaymentConfirm" onPress={handlePaymentConfirm} />
      
      <Text>OrderSummary</Text>
      <Button title="OrderSummary" onPress={handleOrderSummary} />
      
      <Text>Scheduling</Text>
      <Button title="Scheduling" onPress={handleScheduling} />
      
      <Text>OrderPlaced</Text>
      <Button title="OrderPlaced" onPress={handleOrderPlaced} />
      
      
      <Button title="Register" onPress={handleRegister} />
      <Button title="landing" onPress={handlelanding} />
      <Button title="testing" onPress={handletest} />
      </ScrollView>
    </View>
  );
};
export default HomeScreen;