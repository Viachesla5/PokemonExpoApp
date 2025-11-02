import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useIsFavorite } from '@/hooks/use-favorites';
import { useToggleFavorite } from '@/hooks/use-favorites';

interface FavoriteHeaderProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
}

export default function FavoriteHeader({ pokemonId, pokemonName, imageUrl }: FavoriteHeaderProps) {
  const { data: isFavorited, isLoading } = useIsFavorite(pokemonId);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = () => {
    if (isLoading || toggleFavorite.isPending) return;

    if (Platform.OS === 'ios') {
      if (isFavorited) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    toggleFavorite.mutate({
      pokemonId,
      name: pokemonName,
      imageUrl,
      isCurrentlyFavorite: isFavorited || false,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={toggleFavorite.isPending || isLoading}
      style={styles.favoriteButton}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorited ? "heart" : "heart-outline"}
        size={24}
        color={isFavorited ? "#FF0000" : "#212121"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 4,
  },
});


