import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface PokemonImageProps {
  id: string | number;
  size?: number;
  variant?: 'pixelated' | 'artwork';
}

export function PokemonImage({ id, size = 200, variant = 'artwork' }: PokemonImageProps) {
  const imageUrl = variant === 'pixelated'
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: 'transparent',
  },
});


