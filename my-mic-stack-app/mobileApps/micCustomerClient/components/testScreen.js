// Import React
import React, { useEffect, useState } from "react";
// Import required components
import {
  SafeAreaView,
  LayoutAnimation,
  StyleSheet,
  View,
  Text,
  ScrollView,
  UIManager,
  TouchableOpacity,
  Platform,
  FlatList,
  Button,
} from "react-native";
import TEST from "../assets/CLOTHES.json";
import {} from "react-native-web";
const clothes = TEST;

const ExpandableListItem = ({ item }) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemContent}>{item["VALUE"]}</Text>
      <Text style={styles.itemContent}>{item["PRICE"]}</Text>
      {/* <Text style={styles.itemContent}>{item["NOTES"]}</Text>
      <Text style={styles.itemContent}>{item["INTERNAL"]}</Text> */}
    </View>
  );
};

const ExpandingList = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={styles.itemTouchable}
        keyExtractor={(item) => `item-${item?.GENDER}`}
      >
        <Text style={styles.itemTitle}>{item.GENDER}</Text>
      </TouchableOpacity>
      {expanded &&
        clothes.MAIN_LIST[0].SUBCLASS[0].CLOTHES.map((clothes) => {
          return <ExpandableListItem item={clothes} />;
        })}
    </View>
  );
};
const onPressFunction = () => {
  
}
const HorizontalMultiScreens = () => {
  const [operation, setOperation] = useState(clothes.MAIN_LIST[0].OPERATION);
  return (clothes.MAIN_LIST.map(({ items }) => (
    <Button title="{String(items.OPERATION)}" onPress={onPressFunction}></Button>
  )))
};

function TestScreen({ navigation }) {
  return (
    <ScrollView style={[styles.background]}>
      <Text>this is for test {clothes.MAIN_LIST[0].OPERATION}</Text>
      <HorizontalMultiScreens />
      {clothes.MAIN_LIST[0].SUBCLASS.map((subclass) => {
        return <ExpandingList item={subclass} />;
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#F5FCFF",
    padding: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#808080",
    width: "95%",
    marginLeft: 16,
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    color: "#606070",
    padding: 10,
  },
  content: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
  },
  itemContainer: {
    flexDirection: "row",
    borderWidth: "1px",
    justifyContent: "space-evenly",
  },
  itemContent: {
    padding: "auto",
  },
});

export default TestScreen;
