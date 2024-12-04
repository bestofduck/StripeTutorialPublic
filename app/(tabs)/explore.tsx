import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, useColorScheme, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import Product from '@/components/Product';
import { addDoc, collection, DocumentData, getDocs, getFirestore } from 'firebase/firestore'
import {firebaseConfig} from '../../firebaseConfig.js'
import {initializeApp} from 'firebase/app';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { CustomerSheetBeta, initPaymentSheet, presentPaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import { publicKey } from '@/constants/StripePublicKey';

function ProductList(){
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app);

  const getProducts = async () =>{
    const res = await getDocs(collection(db, "products"))

    let prods: DocumentData[] = []
    res.forEach(document=>{
      prods.push({id: document.id, data: document.data()})
    })

    return prods
  }

  const addPayment = async (data: any) =>{   
    try{
      const res = await addDoc(collection(db, "payments"), {
        name: data.productName,
        price: Number(data.productPrice)*100
      })

      return res.id
    }
    catch (e){
      console.log(e)
      return null
    }
  }
  
  const getPaymentIntent = async (price: number, productID: string) => {
    const response = await fetch(`https://us-central1-stripe-tutorial-617d0.cloudfunctions.net/getPaymentIntent?price=${price}&currency=eur&productID=${productID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { paymentIntent, ephemeralKey, customer, displayName } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
      displayName
    };
  };

  const initializePaymentSheet = async (price: number, productID: text) => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
      displayName
    } = await getPaymentIntent(price, productID);

    const { error } = await initPaymentSheet({
      merchantDisplayName: displayName,
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
    });

    if (error) {
      console.log(error)
      Alert.alert('Error', 'An error has occurred while setting up your payment. Please try again later.');
    }
  };

  const openPaymentSheet = async (price: number, productID: string) => {
    if(!isPaymentActive){ //only one payment can go on at a time
      setPaymentActive(true)
      setPaymentID(productID)
      
      await initializePaymentSheet(price, productID)
      const {error} = await presentPaymentSheet()

      if (error) {
        console.log(error)
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        Alert.alert('Success', 'Your order is confirmed!');


      }
  
      setPaymentActive(false)
      setPaymentID(null)
    }
  };
  
  const [isPaymentActive, setPaymentActive] = useState(false);
  const [paymentActiveProductID, setPaymentID] = useState<string|null>(null);

  const { data, error, isLoading, refetch, isPending } = useQuery({queryKey: ['products'], queryFn: getProducts});

  const test = CustomerSheetBeta

  return (
    <View style={styles.productsContainer}>
      {isPending && isLoading && <ActivityIndicator/>}
      {!isPending && <FlatList refreshing={isLoading} onRefresh={()=>refetch()} data={data} keyExtractor={item=> item.id} renderItem={({item})=> <Product activePayment={paymentActiveProductID} productID={item.id} onPress={async ()=>await openPaymentSheet(item.data.price, item.id) } productName={item.data.name} productPrice={item.data.price/100} productDescription='This is a description.'/>}/>}
    </View>
  )
}

export default function TabTwoScreen() {
  const theme = useColorScheme() ?? 'light';
  const queryClient = new QueryClient();
  
  const [ephemeralKey, setEphemeralKey] = useState('')
  const [customerID, setCustomerID] = useState('')
  const [showEditPayment, setShowEditPayment] = useState(false)

  const displayEditPaymentInfo = async () => {
    const response = await fetch(`https://us-central1-stripe-tutorial-617d0.cloudfunctions.net/getEphemeralSecret`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { ephemeralKey, customer } = await response.json();

    setEphemeralKey(ephemeralKey)
    setCustomerID(customer)
    setShowEditPayment(true)

  };

  return (
  <StripeProvider publishableKey={publicKey}>
    <SafeAreaView style={styles.container}>
      <View style={styles.headingContainer}>
        <ThemedText type="title">Your Products</ThemedText>
        <Pressable onPress={async () => await displayEditPaymentInfo()}><ThemedText type="purpleBold">Edit Payment Info</ThemedText></Pressable>
      </View>
      <CustomerSheetBeta.CustomerSheet visible={showEditPayment} onResult={()=>setShowEditPayment(false)} customerId={customerID} customerEphemeralKeySecret={ephemeralKey}></CustomerSheetBeta.CustomerSheet>
      <View>
        <QueryClientProvider client={queryClient}>
          <ProductList></ProductList>
        </QueryClientProvider>
      </View>     
    </SafeAreaView>
  </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container:{
    display: 'flex',
    marginVertical: 70,
    marginHorizontal: 30
  },
  productsContainer:{
    marginTop: 30,
  },
  headingContainer:{
    gap: 3
  }
});
