import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';  // Sem a extensão .tsx
import MenuScreen from './screens/MenuScreen';  // Certifique-se de que este arquivo exista na pasta screens

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Meu Questionário' }} 
        />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ title: 'Menu' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
