import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useDispatch } from 'react-redux';
import { CarFront, List, Bell } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { store } from './src/store';
import { fetchSlots, subscribeToLiveUpdates } from './src/store/slotsSlice';
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

function RootTabs() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSlots());
    const unsubscribe = subscribeToLiveUpdates(dispatch);
    return unsubscribe;
  }, [dispatch]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.ink },
        tabBarActiveTintColor: colors.occupied,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border }
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'ParkLOG',
          tabBarIcon: ({ color, size }) => <CarFront color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          title: 'Slots',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border
  }
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer theme={theme}>
        <StatusBar style="dark" />
        <RootTabs />
      </NavigationContainer>
    </Provider>
  );
}
