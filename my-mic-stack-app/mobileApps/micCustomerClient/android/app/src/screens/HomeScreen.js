// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CardDetails from './CardDetailsScreen';
import SignUpScreen from './RegisterScreen';
import { View } from 'react-native';

const Stack = createStackNavigator();

const HomeScreen = () => {
  return (
    <View>
      <Stack.Navigator>
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        {/* Add other screens as needed */}
      </Stack.Navigator>
    </View>
  );
};

export default HomeScreen;
