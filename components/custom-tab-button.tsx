import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CustomTabButtonProps extends BottomTabBarButtonProps {
  iconName: string;
  iconNameFocused?: string;
  label: string;
}

export function CustomTabButton({ 
  iconName, 
  iconNameFocused, 
  label, 
  accessibilityState, 
  onPress,
  children,
  ...props 
}: CustomTabButtonProps) {
  const focused = accessibilityState?.selected;
  const icon = focused && iconNameFocused ? iconNameFocused : iconName;

  const handlePress = (e: any) => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  const { style, ...touchableProps } = props as any;

  return (
    <TouchableOpacity
      {...touchableProps}
      onPress={handlePress}
      style={[
        styles.tabButton,
        focused && styles.tabButtonFocused,
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        <Ionicons
          name={icon as any}
          size={24}
          color={focused ? '#FFFFFF' : '#9E9E9E'}
        />
        <Text
          style={[
            styles.tabLabel,
            focused && styles.tabLabelFocused,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabButtonFocused: {
    backgroundColor: '#9C27B0',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: '#9E9E9E',
  },
  tabLabelFocused: {
    color: '#FFFFFF',
  },
});

