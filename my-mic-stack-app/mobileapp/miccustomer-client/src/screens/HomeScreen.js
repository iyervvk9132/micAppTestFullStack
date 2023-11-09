import { createAppContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import CardDetails from './CardDetailsScreen';
import Landing from './landing screen';
import LocationScreen from './LocationScreen';
import LoginScreen from './LoginScreen';
import MessagingScreen from './MessagingScreen';
import MobileNumberScreen from './MobileNumberScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Landing} />
      <Stack.Screen name="Location" component={LocationScreen} />
    </Stack.Navigator>
  );
};

export default createAppContainer(AppNavigator);
