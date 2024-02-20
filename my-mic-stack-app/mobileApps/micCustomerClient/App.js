import {StatusBar } from 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RNGestureHandlerModule from 'react-native-gesture-handler';

import HomeScreen from './components/HomeScreen'; 
import RegisterScreen from './components/RegisterScreen'; 
import LoginScreen from './components/LoginScreen'; 
import CardDetailsScreen from './components/CardDetailsScreen'; 
import OrdersScreen from './components/OrdersScreen'; 
import MessagingScreen from './components/MessagingScreen'; 
import SizesScreen from './components/SizesScreen'; 
import PricelistScreen from './components/PricelistScreen'; 
import OrderDetailsScreen from './components/OrderDetailsScreen'; 
import NotificationsScreen from './components/NotificationsScreen'; 
import VerificationScreen from './components/VerificationScreen'; 
import LocationScreen from './components/LocationScreen'; 
import MobileNumberScreen from './components/MobileNumberScreen'; 
import SelectDressScreen from './components/SelectDressScreen'; 
import PaymentConfirmScreen from './components/PaymentConfirmScreen'; 
import OrderSummaryScreen from './components/OrderSummaryScreen'; 
import SchedulingScreen from './components/SchedulingScreen'; 
import OrderPlacedScreen from './components/OrderPlacedScreen'; 
import Landing from './components/landingScreen';
import testScreen from './components/testScreen';
import OTPverificationScreen from './components/OTPVerification';
import second from './components/h'


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTPverification" component={OTPverificationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="Messaging" component={MessagingScreen} />
        <Stack.Screen name="Sizes" component={SizesScreen} />
        <Stack.Screen name="Pricelist" component={PricelistScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
        <Stack.Screen name="SelectDress" component={SelectDressScreen} />
        <Stack.Screen name="PaymentConfirm" component={PaymentConfirmScreen} />
        <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
        <Stack.Screen name="Scheduling" component={SchedulingScreen} />
        <Stack.Screen name="OrderPlaced" component={OrderPlacedScreen} />
        <Stack.Screen name="Landing" component={Landing} />   
        <Stack.Screen name="test" component={testScreen} />          
        <Stack.Screen name="HomeUser" component={HomeUserScreen} />
    
      </Stack.Navigator>
    </NavigationContainer>
  );
}
