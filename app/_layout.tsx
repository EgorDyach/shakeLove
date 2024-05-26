import React, { useEffect, useState } from "react";
import Index from "./Index";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from '@react-navigation/native';
import Login from "./Login";

import { Text, StyleSheet, Switch, SafeAreaView } from 'react-native'

export default function RootLayout() {
  const isSinged = false;
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Index" screenOptions={{
      contentStyle: {
        backgroundColor: "#ddd"
      },
      headerShown: false
    }}>
      {/* {isSinged ? */}
      <Stack.Screen name="Index" component={Index} />
      {/* : */}
      {/* <Stack.Screen name="Login" component={Login} /> */}
      {/* } */}
    </Stack.Navigator >
  );
}
