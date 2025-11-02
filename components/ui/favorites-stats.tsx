import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { FavoritePokemon } from '@/services/database';
import { useQuery, useQueries } from '@tanstack/react-query';
import { PokeApiService } from '@/services/pokemon-api';

interface FavoritesStatsProps {
  favorites: FavoritePokemon[];
}

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

const getGenerationFromId = (id: number): number => {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  if (id <= 1010) return 9;
  return 1;
};

export default function FavoritesStats({ favorites }: FavoritesStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const basicStats = useMemo(() => {
    if (favorites.length === 0) {
      return { minId: 0, maxId: 0, avgId: 0, generations: {} };
    }

    const ids = favorites.map((f) => f.id);
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);
    const avgId = Math.round(ids.reduce((sum, id) => sum + id, 0) / ids.length);

    const generations: { [key: number]: number } = {};
    favorites.forEach((fav) => {
      const gen = getGenerationFromId(fav.id);
      generations[gen] = (generations[gen] || 0) + 1;
    });

    return { minId, maxId, avgId, generations };
  }, [favorites]);

  const pokemonQueries = useQueries({
    queries: favorites.map((fav) => ({
      queryKey: ['pokemon', fav.name],
      queryFn: () => PokeApiService.getPokemonByName(fav.name),
      staleTime: 10 * 60 * 1000,
    })),
  });

  const allLoaded = pokemonQueries.every((query) => !query.isLoading && query.data);

  const typeDistribution = useMemo(() => {
    if (!allLoaded) return {};

    const types: { [key: string]: number } = {};
    pokemonQueries.forEach((query) => {
      if (query.data?.types) {
        query.data.types.forEach((typeInfo) => {
          const typeName = typeInfo.type.name;
          types[typeName] = (types[typeName] || 0) + 1;
        });
      }
    });
    return types;
  }, [allLoaded, pokemonQueries]);

  const topTypes = useMemo(() => {
    return Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [typeDistribution]);

  if (favorites.length === 0) return null;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        Statistics
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {basicStats.minId}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Lowest ID
          </Text>
        </View>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {basicStats.maxId}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Highest ID
          </Text>
        </View>
        <View style={[styles.statCard, isDark && styles.statCardDark]}>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>
            {basicStats.avgId}
          </Text>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
            Avg ID
          </Text>
        </View>
      </View>

      {Object.keys(basicStats.generations).length > 0 && (
        <View style={styles.generationSection}>
          <Text style={[styles.subsectionTitle, isDark && styles.subsectionTitleDark]}>
            Generations
          </Text>
          <View style={styles.generationList}>
            {Object.entries(basicStats.generations)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([gen, count]) => (
                <View key={gen} style={[styles.generationBadge, isDark && styles.generationBadgeDark]}>
                  <Text style={[styles.generationText, isDark && styles.generationTextDark]}>
                    Gen {gen}: {count}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {allLoaded && topTypes.length > 0 && (
        <View style={styles.typeSection}>
          <Text style={[styles.subsectionTitle, isDark && styles.subsectionTitleDark]}>
            Most Common Types
          </Text>
          <View style={styles.typeList}>
            {topTypes.map(([typeName, count]) => (
              <View
                key={typeName}
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTypeColor(typeName) },
                ]}
              >
                <Text style={styles.typeText}>
                  {typeName.charAt(0).toUpperCase() + typeName.slice(1)} ({count})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#2A2A3E',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E0940',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statCardDark: {
    backgroundColor: '#3A3A3A',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E0940',
    marginBottom: 4,
  },
  statValueDark: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statLabelDark: {
    color: '#CCCCCC',
  },
  generationSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E0940',
    marginBottom: 8,
  },
  subsectionTitleDark: {
    color: '#FFFFFF',
  },
  generationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  generationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E1BEE7',
    borderRadius: 16,
  },
  generationBadgeDark: {
    backgroundColor: '#7B1FA2',
  },
  generationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0E0940',
  },
  generationTextDark: {
    color: '#FFFFFF',
  },
  typeSection: {
    marginBottom: 8,
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
});

