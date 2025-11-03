import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#0E0940',
        tabBarInactiveTintColor: '#5C5C83',
        tabBarStyle: {
          backgroundColor: '#E3F2FD',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          height: 80 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 12,
        },
        tabBarItemStyle: {
          padding: 0,
          margin: 0,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginTop: 4,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokémons',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/active_icon_pokemons_page.png')
                  : require('@/assets/images/inactive_icon_pokemons_page.png')
              }
              style={{ 
                width: focused ? 78 : 30, 
                height: focused ? 78 : 30,
                tintColor: focused ? undefined : '#5C5C83'
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/active_icon_favorites_page.png')
                  : require('@/assets/images/inactive_icon_favorites_page.png')
              }
              style={{ 
                width: focused ? 78 : 30, 
                height: focused ? 78 : 30,
                tintColor: focused ? undefined : '#5C5C83'
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
