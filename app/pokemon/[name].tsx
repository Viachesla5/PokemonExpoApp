import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { usePokemonByName } from '@/hooks/use-pokemon';
import { PokemonImage } from '@/components/ui/pokemon-image';
import { PokemonSkeleton } from '@/components/ui/pokemon-skeleton';
import Favorite from '@/components/ui/favorite';
import { useColorScheme } from '@/hooks/use-color-scheme';

const getTypeColor = (typeName: string): string => {
  const typeColors: { [key: string]: string } = {
    electric: '#FDD835',
    fire: '#F44336',
    water: '#2196F3',
    grass: '#4CAF50',
    ghost: '#9C27B0',
    psychic: '#E91E63',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    steel: '#B8B8D0',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
  };
  return typeColors[typeName.toLowerCase()] || '#757575';
};

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { data: pokemon, isLoading, error } = usePokemonByName(name as string);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerStyle: { backgroundColor: isDark ? '#C62828' : '#EF5350' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <ScrollView style={styles.scrollView}>
          <PokemonSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen
          options={{
            title: 'Pokémon Not Found',
            headerStyle: { backgroundColor: isDark ? '#C62828' : '#EF5350' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pokémon not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pokemonDisplayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKg = (pokemon.weight / 10).toFixed(1);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: pokemonDisplayName,
          headerStyle: { backgroundColor: isDark ? '#C62828' : '#EF5350' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <View style={styles.headerRight}>
              <Favorite
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
                imageUrl={imageUrl}
              />
            </View>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.pokemonName, isDark && styles.pokemonNameDark]}>
            {pokemonDisplayName}
          </Text>
          <Text style={[styles.pokemonId, isDark && styles.pokemonIdDark]}>
            #{pokemon.id.toString().padStart(3, '0')}
          </Text>
        </View>
        
        <View style={[styles.imageContainer, isDark && styles.imageContainerDark]}>
          <PokemonImage id={pokemon.id} size={200} />
        </View>
        
        <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Types</Text>
          <View style={styles.typesContainer}>
            {pokemon.types.map((typeInfo, index) => {
              const typeColor = getTypeColor(typeInfo.type.name);
              return (
                <View key={index} style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                  <Text style={styles.typeText}>
                    {typeInfo.type.name.charAt(0).toUpperCase() + 
                     typeInfo.type.name.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Height</Text>
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {heightInMeters} m
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Weight</Text>
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {weightInKg} kg
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Abilities</Text>
          <View style={styles.abilitiesContainer}>
            {pokemon.abilities.map((abilityInfo, index) => (
              <View 
                key={index} 
                style={[styles.abilityBadge, isDark && styles.abilityBadgeDark]}
              >
                <Text style={[styles.abilityText, isDark && styles.abilityTextDark]}>
                  {abilityInfo.ability.name.charAt(0).toUpperCase() + 
                   abilityInfo.ability.name.slice(1).replace('-', ' ')}
                  {abilityInfo.is_hidden && ' (Hidden)'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  containerDark: {
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0E0940',
    textTransform: 'capitalize',
  },
  pokemonNameDark: {
    color: '#FFFFFF',
  },
  pokemonId: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  pokemonIdDark: {
    color: '#CCCCCC',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageContainerDark: {
    backgroundColor: '#2A2A3E',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsContainerDark: {
    backgroundColor: '#2A2A3E',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E0940',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  statLabelDark: {
    color: '#CCCCCC',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E0940',
  },
  statValueDark: {
    color: '#FFFFFF',
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  abilityBadgeDark: {
    backgroundColor: '#3A3A3A',
  },
  abilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0E0940',
    textTransform: 'capitalize',
  },
  abilityTextDark: {
    color: '#FFFFFF',
  },
  headerRight: {
    marginRight: 8,
  },
});

