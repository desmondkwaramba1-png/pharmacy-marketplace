import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { WeatherScreen } from '../screens/WeatherScreen';
import { CostAnalysisScreen } from '../screens/CostAnalysisScreen';
import { EarlyWarningScreen } from '../screens/EarlyWarningScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CustomTabBar } from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const ScanStack = createNativeStackNavigator();
const WeatherStack = createNativeStackNavigator();

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen name="ScanMain" component={ScanScreen} />
      <ScanStack.Screen name="Results" component={ResultsScreen} />
    </ScanStack.Navigator>
  );
}

function WeatherStackNavigator() {
  return (
    <WeatherStack.Navigator screenOptions={{ headerShown: false }}>
      <WeatherStack.Screen name="WeatherMain" component={WeatherScreen} />
      <WeatherStack.Screen name="CostAnalysis" component={CostAnalysisScreen} />
    </WeatherStack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="AlertsTab" component={EarlyWarningScreen} />
      <Tab.Screen name="ScanTab" component={ScanStackNavigator} />
      <Tab.Screen name="WeatherTab" component={WeatherStackNavigator} />
      <Tab.Screen name="ProfileTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
