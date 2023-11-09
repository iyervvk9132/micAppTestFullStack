import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Categories from './src/components/categories';
import  data from './src/services/TEST.json'
import Landing from './src/screens/landing screen';
import HomeScreen from './src/screens/HomeScreen'


export default function App() {
  // response = JSON.stringify(data.CLOTHES);
  // console.log(response);
  // data.CLOTHES.map((item)=>(
  //   console.log(JSON.stringify(item.NAME,item.VARIABLE_PRICE,item.PRICE))
  // ))

  return (
      <ScrollView>
        <HomeScreen/>

      </ScrollView>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
