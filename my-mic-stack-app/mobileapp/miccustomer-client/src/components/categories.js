// import React from 'react';
import {Text, Image, View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Button} from 'react-native';
// import  data from '../services/TEST.json'
const data = [
  { id: "1A1", name: "Hussain" },
  { id: "1A2", name: "Sabrina" },
];

const renderItem = ({ item }) => {
  //the app will represent each list item via a Text component
  return <Text> {item.id}</Text>;
};

export default function Categories() {
  return (
    <View>
      <Text>Categories</Text>
      <FlatList
      FlatList
      data={data}
      renderItem={({data}) => <Item title={data.title} />}/>
      <Button style={{fontSize: 20, color: 'green'}}
      styleDisabled={{color: 'red'}}
      title="Press Me"
      ></Button>
    </View>
  );
}

//use CSS to decorate our list
const styles1 = StyleSheet.create({
  item: {
    backgroundColor: "blue",
    color: "white",
    padding: 2,
    margin: 2,
  },
});
