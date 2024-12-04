import { TouchableWithoutFeedback, StyleSheet, Platform, View, TextInput, KeyboardAvoidingView, Button, Pressable, Alert, useColorScheme, ActivityIndicator, Keyboard } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { firebaseConfig } from '@/firebaseConfig';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection, DocumentData, addDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const StripeLogo = require('../../assets/images/stripe-icon.jpeg')

const FIELD_REQUIRED = 'This field is required'

function AddProductForm(){
  const theme = useColorScheme() ?? 'light';
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app);

  const [queryEnabled, toggleQuery] = useState(false)
  const {control, handleSubmit, getValues, reset, formState: {errors}} = useForm()
  const { data, error, isLoading, status } = useQuery({queryKey: ['newProduct'], queryFn: () => addProduct({productName: getValues('productName'), productPrice: getValues('productPrice')}), enabled: queryEnabled});

  const submitForm = () => {
    Keyboard.dismiss()
    toggleQuery(true);
  }

  let priceInput:TextInput|null;

  return (
      <KeyboardAvoidingView style={{alignItems: 'baseline', width: '60%'}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ThemedText type="default" style={styles.inputLabel}>Name</ThemedText>
          <View style={styles.inputOuterContainer}>
            <Controller name="productName" control={control} rules={{required: true}} render={({ field: { onChange, onBlur, value } }) =>(
              <TextInput onSubmitEditing={()=>priceInput?.focus()} enterKeyHint='next' onBlur={onBlur} onChangeText={onChange} value={value} style={{...styles.input, ...styles.inputWithoutContainer}}/>
            )}/>
            {errors.productName && <ThemedText type="error" style={styles.inputLabel}>This field is required</ThemedText>}
          </View>
          

          <ThemedText type="default" style={styles.inputLabel}>Price</ThemedText>
          <View style={styles.inputOuterContainer}>
            <Controller name="productPrice" control={control} rules={{required: FIELD_REQUIRED, pattern: {value: /^[1-9][0-9]*(\.[0-9]{2})?$/, message: 'Invalid price'}}} render={({ field: { onChange, onBlur, value } }) =>(
              <View style={styles.inputContainer}>
                <ThemedText style={{...styles.inputPrefix, color: Colors.light.text}}>€</ThemedText>
                <TextInput ref={(input) => { priceInput = input; }} onSubmitEditing={handleSubmit(submitForm)} onBlur={onBlur} onChangeText={onChange} value={value} enterKeyHint='done' keyboardType='decimal-pad' style={{...styles.input, flex: 1}}/>
              </View>
            )}/>
            {errors.productPrice && <ThemedText type="error" style={styles.inputLabel}>{errors.productPrice?.message}</ThemedText>}
          </View>
          
          
        
          <View style={styles.bottomContainer}>
            {isLoading && <ActivityIndicator/>}
            {status === 'success' && data !== null && <Ionicons name="checkmark-sharp" size={25} color="green"></Ionicons>}
            {status === 'error' || (status === 'success' && data === null) && <Ionicons name="alert-circle" size={25} color="red"></Ionicons>}
            <Pressable disabled={isLoading} style={styles.submit} onPress={handleSubmit(submitForm)}>
              <ThemedText style={styles.submitText}>Add Product</ThemedText>
            </Pressable>
          </View>
          
        
      </KeyboardAvoidingView>      
  )
}

export default function HomeScreen() {
  const queryClient = new QueryClient();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.title}>
          <Image source={StripeLogo} style={styles.logo}/>
          <ThemedText type="title">Stripe Tutorial</ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>Input your product's details</ThemedText>
        </View>

        <QueryClientProvider client={queryClient}>
            <AddProductForm></AddProductForm>
        </QueryClientProvider>
        

      </SafeAreaView>
    </TouchableWithoutFeedback>
    
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //     <HelloWave />
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //     <ThemedText>
    //       Tap the Explore tab to learn more about what's included in this starter app.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       When you're ready, run{' '}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container:{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  title:{
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginBottom: 25
  },
  subtitle:{
    marginTop: 5,
    marginBottom: 25
  },
  inputLabel:{
    marginBottom: 5,
    marginLeft: 5
  },
  input: {  
    paddingVertical: 13,
    paddingHorizontal: 10,        
    fontSize: 16,               
    backgroundColor: '#f9f9f9', 
    color: '#333',   
    borderRadius: 10,  
    width: '100%',
  },
  inputWithoutContainer:{
    borderWidth: 1,           
    borderColor: '#ccc',          
    marginBottom: 10
  },
  inputOuterContainer:{
    marginBottom: 20,  
    width: '100%'
  },

  inputContainer: {           
    fontSize: 16,            
    borderWidth: 1,           
    borderColor: '#ccc',      
    borderRadius: 10,       
    backgroundColor: '#f9f9f9', 
    color: '#333',    
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  inputPrefix:{
    paddingLeft: 10
  },
  submit: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#635DF6', // Primary blue background
    borderRadius: 10,         // Rounded corners
    alignItems: 'center',     // Center text horizontally
    justifyContent: 'center', // Center text vertically
    alignSelf: 'flex-end',
  },
  submitText:{
    color: '#f9f9f9',
  },
  bottomContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center'
  }
});
