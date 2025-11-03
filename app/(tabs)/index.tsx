import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonList, useAllPokemonForSearch } from '@/hooks/use-pokemon';
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

  const { data: allPokemonData } = useAllPokemonForSearch();

  const pokemonData: Pokemon[] = React.useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchList = allPokemonData?.results || [];
      
      return searchList
        .filter((item) =>
          item.name.toLowerCase().includes(query) ||
          item.id.toString().includes(query)
        )
        .map((item) => ({
          id: parseInt(item.id, 10),
          name: item.name,
          type: 'Normal',
        }));
    }

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
  }, [data, searchQuery, allPokemonData]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Error loading Pokemon: {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
    backgroundColor: '#E3F2FD',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#000000',
    padding: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#000000',
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

