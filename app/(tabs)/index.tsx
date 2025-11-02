import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePokemonList } from '@/hooks/use-pokemon';
import PokemonList from '@/components/ui/pokemon-list';
import type { Pokemon } from '@/components/ui/pokemon-list';

export default function AllPokemonScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    isFetchingNextPage, 
    hasNextPage 
  } = usePokemonList(20);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.loadingText, isDark ? styles.titleDark : styles.titleLight]}>
            Loading Pokemon...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, isDark ? styles.titleDark : styles.titleLight]}>
            Error loading Pokemon: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pokemonData: Pokemon[] = React.useMemo(() => {
    const allPokemon = (data?.pages || []).flatMap((page) =>
      page.results.map((item) => ({
        id: parseInt(item.id, 10),
        name: item.name,
        type: 'Normal',
      }))
    );
    
    const uniquePokemon = Array.from(
      new Map(allPokemon.map((p) => [p.id, p])).values()
    );
    
    return uniquePokemon;
  }, [data]);

  return (
    <SafeAreaView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
          All Pokémon ({pokemonData.length})
        </Text>
      </View>
      <PokemonList 
        data={pokemonData} 
        onLoadMore={() => fetchNextPage()}
        isLoadingMore={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#EF5350',
  },
  containerDark: {
    backgroundColor: '#C62828',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleLight: {
    color: '#FFFFFF',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

