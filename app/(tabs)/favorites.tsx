import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import PokemonList from '@/components/ui/pokemon-list';
import type { Pokemon } from '@/components/ui/pokemon-list';
import FavoritesStats from '@/components/ui/favorites-stats';
import { Fonts } from '@/constants/fonts';

export default function FavoritesScreen() {
  const { data: favorites, isLoading, error } = useFavorites();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>My Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#EF5350"} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !favorites || favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>My Favorites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.textDark]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
            Tap the heart icon on any Pokémon to add it to your favorites!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pokemonData: Pokemon[] = favorites.map((fav) => ({
    id: fav.id,
    name: fav.name,
    type: 'Normal',
  }));

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Text style={[styles.title, isDark && styles.titleDark]}>My Favorites</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {favorites.length} {favorites.length === 1 ? 'Pokémon' : 'Pokémon'} saved
          </Text>
        </View>
        <FavoritesStats favorites={favorites} />
        <View style={styles.listHeader}>
          <Text style={[styles.listHeaderText, isDark && styles.listHeaderTextDark]}>
            Your Favorite Pokémon
          </Text>
        </View>
        <PokemonList data={pokemonData} scrollEnabled={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  containerDark: {
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#E3F2FD',
  },
  headerDark: {
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 4,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666666',
  },
  subtitleDark: {
    color: '#CCCCCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#666666',
  },
  textDark: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptySubtextDark: {
    color: '#CCCCCC',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listHeaderText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#000000',
  },
  listHeaderTextDark: {
    color: '#FFFFFF',
  },
});

