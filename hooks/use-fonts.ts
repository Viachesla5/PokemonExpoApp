import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export function useCustomFonts() {
  const [fontsLoaded, fontError] = useFonts({
    'Rubik-Regular': require('@/assets/fonts/Rubik-Regular.ttf'),
    'Rubik-Medium': require('@/assets/fonts/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('@/assets/fonts/Rubik-SemiBold.ttf'),
    'Rubik-Bold': require('@/assets/fonts/Rubik-Bold.ttf'),
    'Rubik-Light': require('@/assets/fonts/Rubik-Light.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return {
    fontsLoaded,
    fontError,
  };
}

