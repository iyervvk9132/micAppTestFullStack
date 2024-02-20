import React, {useState} from 'react';
import {StyleSheet, Text, TouchableHighlight, View,TouchableOpacity} from 'react-native';

const CardDetailsScreen = () => {
  const [count, setCount] = useState(0);
  const onPress = () => {
    setCount(count+1);
    alert(count);
    
  }
  const onReset = () => {
    setCount(0)
    
  }

  return (
    <View style={styles.container}>
    <TouchableOpacity  style={styles.button} onPress={onPress}>
        <Text >Touch Here {count || null}</Text>
    </TouchableOpacity >
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{count || null}</Text>
      </View>
      <TouchableOpacity  style={styles.button} onPress={onReset}>
          <Text >reset here </Text>
      </TouchableOpacity >
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
  countContainer: {
    alignItems: 'center',
    padding: 10,
  },
  countText: {
    color: '#FF00FF',
  },
});

export default CardDetailsScreen;