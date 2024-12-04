import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, useColorScheme, Pressable, ViewProps, PressableProps, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { Colors } from '@/constants/Colors';

export type ProductProps = PressableProps & {
    productName: string;
    productPrice: number;
    productDescription: string;
    activePayment: string|null;
    productID: string;
  };

export default function Product({productName, productPrice, productDescription, onPress, activePayment, productID, ...rest}: ProductProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <Pressable style={{...styles.product, backgroundColor: theme === 'dark' ? 'grey' : '#f9f9f9'}} onPress={onPress} >
        <View>
          <ThemedText type="titleSmall">{productName}</ThemedText>
          <ThemedText type="small">{productDescription}</ThemedText>
        </View>

        <View style={styles.productRHS}>
          <ThemedText type="titleSmall">€{productPrice}</ThemedText>
          {activePayment === productID && <ActivityIndicator/>}
          {activePayment !== productID && <Ionicons name="chevron-forward-outline" size={18} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}></Ionicons>}
        </View>
        
    </Pressable>
  );
}

const styles = StyleSheet.create({
  product:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 15, 
    borderRadius: 10,  
    marginBottom: 15
  },
  productRHS:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 7
  }
});
