import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFavorite } from '@/hooks/use-favorites';
import { useToggleFavorite } from '@/hooks/use-favorites';

interface FavoriteProps {
  pokemonId: number;
  pokemonName: string;
  imageUrl?: string;
}

export default function Favorite({ pokemonId, pokemonName, imageUrl }: FavoriteProps) {
  const { data: isFavorited, isLoading } = useIsFavorite(pokemonId);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = () => {
    if (isLoading || toggleFavorite.isPending) return;

    toggleFavorite.mutate({
      pokemonId,
      name: pokemonName,
      imageUrl,
      isCurrentlyFavorite: isFavorited || false,
    });
  };

  if (isLoading) {
    return (
      <TouchableOpacity style={styles.favoriteButton} disabled>
        <ActivityIndicator size="small" color="#666" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.favoriteButton}
      onPress={handleToggle}
      disabled={toggleFavorite.isPending}
    >
      <Ionicons
        name={isFavorited ? "heart" : "heart-outline"}
        size={24}
        color={isFavorited ? "#FF6B6B" : "#666"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

