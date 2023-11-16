// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './android/app/src/screens/HomeScreen';
import SignUpScreen from './android/app/src/screens/RegisterScreen';
import {View,Text} from 'react-native'

const Stack = createStackNavigator();

const App = () => {
  return (
    <View>
      <Text>hi</Text>
      {/* <SignUpScreen></SignUpScreen>    */}
      
      

    </View>
  );
};

export default App;
