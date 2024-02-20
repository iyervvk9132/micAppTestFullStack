import React from "react";
import { Text, View, Button,StyleSheet } from "react-native";
// import Dropdown from "react-native-multi-level-selector";

import TEST from "../assets/CLOTHES.json";
import { ScrollView } from "react-native-gesture-handler";
import DropdownCard from "./DropDownCard";

const clothes = TEST;

function SelectDressScreen({ navigation }) {
  const PriceList = ({clothing}) =>{
    return(
      <View style={[
        styles.container,
        {
          flexDirection:'row'
        }
      ]        
      }>

      <Text>{clothing["ID"]}</Text>
        <Text>{clothing["VALUE"]}</Text>
        <Text>{clothing["VARIABLE_PRICE"]}</Text>
        <Text>{clothing["PRICE"]}</Text>
        <Text>{clothing["NOTES"]}</Text>
        <Text>{clothing["INTERNAL"]}</Text>

      </View>
    )
  }
  const pricelist=clothes.MAIN_LIST[0].SUBCLASS[0].CLOTHES[0];
  return (
    <ScrollView style={[styles.background]}>
      <Text>this is for text {clothes.MAIN_LIST[0].OPERATION}</Text>
      <PriceList clothing={pricelist}/>


      {clothes.MAIN_LIST.map((cloth) => {
        return (
          <View>
            <Text>{cloth["OPERATION"]}</Text>
            {cloth["SUBCLASS"].map((subClass) => {
              return (
                <View>
                  <Text>{subClass["GENDER"]}</Text>

                  {subClass["CLOTHES"].map((clothes) => {
                    return (
                      <View>
                        <Text>
                          <PriceList clothing={clothes}/>
                          
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  background:{
    flex: 1,
    alignContent:"center",


  },
  container: {
    flex: 1,
    padding: 20,
    alignItems:"center",
  },
});
export default SelectDressScreen;
