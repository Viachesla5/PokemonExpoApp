import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabButton } from '@/components/custom-tab-button';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#E3F2FD',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pokémons',
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              iconName="ellipse-outline"
              iconNameFocused="radio-button-on"
              label="Pokémons"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              iconName="heart-outline"
              iconNameFocused="heart"
              label="Favorites"
            />
          ),
        }}
      />
    </Tabs>
  );
}
