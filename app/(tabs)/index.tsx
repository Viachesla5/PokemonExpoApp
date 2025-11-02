import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonList } from '@/hooks/use-pokemon';
import PokemonList from '@/components/ui/pokemon-list';
import type { Pokemon } from '@/components/ui/pokemon-list';
import { Fonts } from '@/constants/fonts';

export default function AllPokemonScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    isFetchingNextPage, 
    hasNextPage 
  } = usePokemonList(20);

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
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return uniquePokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(query) ||
        pokemon.id.toString().includes(query)
      );
    }
    
    return uniquePokemon;
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>
            Loading Pokemon...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Error loading Pokemon: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Pokémon.."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>
          All Pokémon
        </Text>
      </View>
      <PokemonList 
        data={pokemonData} 
        onLoadMore={() => fetchNextPage()}
        isLoadingMore={isFetchingNextPage}
        hasNextPage={hasNextPage && !searchQuery.trim()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#333333',
    padding: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: '#212121',
    textAlign: 'left',
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
    fontFamily: Fonts.regular,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: '#666666',
  },
});

