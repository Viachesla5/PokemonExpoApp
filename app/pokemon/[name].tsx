import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Pressable, Share, Alert, Platform, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { usePokemonByName, usePokemonSpecies, useEvolutionChain } from '@/hooks/use-pokemon';
import { PokemonImage } from '@/components/ui/pokemon-image';
import { PokemonSkeleton } from '@/components/ui/pokemon-skeleton';
import FavoriteHeader from '@/components/ui/favorite-header';
import { PokeApiService } from '@/services/pokemon-api';
import { Fonts } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getTypeCircleColor = (typeName: string): string => {
  const typeColors: { [key: string]: string } = {
    electric: '#FFCB05',
    fire: '#FF0000',
    water: '#2196F3',
    grass: '#6CBB5C',
    ghost: '#A33EA1',
    psychic: '#E91E63',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A33EA1',
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

type TabType = 'about' | 'stats' | 'evolution';

interface EvolutionChainItem {
  name: string;
  id: number;
}

async function fetchPokemonIdFromSpecies(speciesName: string): Promise<number | null> {
  try {
    const pokemon = await PokeApiService.getPokemonByName(speciesName);
    return pokemon?.id || null;
  } catch (error) {
    console.error(`Error fetching Pokemon ID for ${speciesName}:`, error);
    return null;
  }
}

async function parseEvolutionChainAsync(chain: any): Promise<EvolutionChainItem[]> {
  const evolutions: EvolutionChainItem[] = [];
  
  async function traverse(current: any) {
    if (!current) return;
    
    if (current?.species) {
      const speciesName = current.species.name;
      if (speciesName) {
        const pokemonId = await fetchPokemonIdFromSpecies(speciesName);
        if (pokemonId) {
          evolutions.push({
            name: speciesName,
            id: pokemonId,
          });
        }
      }
    }
    
    if (current?.evolves_to && Array.isArray(current.evolves_to) && current.evolves_to.length > 0) {
      for (const next of current.evolves_to) {
        await traverse(next);
      }
    }
  }
  
  if (chain) {
    await traverse(chain);
  }
  
  return evolutions;
}

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const translateX = useRef(new Animated.Value(0)).current;
  const tabAnimatedValue = useRef(new Animated.Value(0)).current;
  const { data: pokemon, isLoading, error } = usePokemonByName(name as string);
  
  const speciesUrl = useMemo(() => {
    if (!pokemon?.species) return null;
    if (typeof pokemon.species === 'string') return pokemon.species;
    if (typeof pokemon.species === 'object' && 'url' in pokemon.species) {
      return pokemon.species.url || null;
    }
    return null;
  }, [pokemon]);
  
  const { data: species, isLoading: isLoadingSpecies } = usePokemonSpecies(speciesUrl);
  
  const evolutionChainUrl = useMemo(() => {
    return species?.evolution_chain?.url || null;
  }, [species]);
  
  const { data: evolutionChainData, isLoading: isLoadingEvolution } = useEvolutionChain(evolutionChainUrl);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChainItem[]>([]);
  const [isParsingEvolution, setIsParsingEvolution] = useState(false);

  useEffect(() => {
    const loadEvolutionChain = async () => {
      if (evolutionChainData?.chain) {
        setIsParsingEvolution(true);
        try {
          const parsed = await parseEvolutionChainAsync(evolutionChainData.chain);
          setEvolutionChain(parsed);
        } catch (error) {
          console.error('Error parsing evolution chain:', error);
          setEvolutionChain([]);
        } finally {
          setIsParsingEvolution(false);
        }
      } else {
        setEvolutionChain([]);
        setIsParsingEvolution(false);
      }
    };

    loadEvolutionChain();
  }, [evolutionChainData]);

  useEffect(() => {
    const tabs: TabType[] = ['about', 'stats', 'evolution'];
    const currentIndex = tabs.indexOf(activeTab);
    
    Animated.spring(tabAnimatedValue, {
      toValue: currentIndex,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabAnimatedValue]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
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
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pokémon not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pokemonDisplayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const formattedId = pokemon.id.toString().padStart(3, '0');
  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKg = (pokemon.weight / 10).toFixed(1);
  const baseExperience = pokemon.base_experience || 0;

  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Name</Text>
        <Text style={styles.detailValue}>{pokemonDisplayName}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>ID</Text>
        <Text style={styles.detailValue}>{formattedId}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Base</Text>
        <Text style={styles.detailValue}>{baseExperience} XP</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Weight</Text>
        <Text style={styles.detailValue}>{weightInKg.replace('.', ',')} kg</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Height</Text>
        <Text style={styles.detailValue}>{heightInMeters.replace('.', ',')} m</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Types</Text>
        <Text style={styles.detailValue}>
          {pokemon.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ')}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailKey}>Abilities</Text>
        <Text style={styles.detailValue}>
          {pokemon.abilities.map(a => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)).join(', ')}
        </Text>
      </View>
    </View>
  );

  const renderStatsTab = () => {
    const maxStat = 200;
    const statMapping: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Special Attack',
      'special-defense': 'Special Defense',
      'speed': 'Speed',
    };
    
    const orderedStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    
    return (
      <View style={styles.tabContent}>
        {orderedStats.map((statKey) => {
          const stat = pokemon.stats.find(s => s.stat.name === statKey);
          if (!stat) return null;
          
          const statValue = stat.base_stat;
          const percentage = (statValue / maxStat) * 100;
          const statName = statMapping[statKey] || stat.stat.name;
          
          return (
            <View key={statKey} style={styles.statRow}>
              <Text style={styles.statName}>{statName}</Text>
              <View style={styles.statBarContainer}>
                <View style={styles.statBarBackground}>
                  <View style={[styles.statBarFill, { width: `${percentage}%` }]} />
                </View>
              </View>
              <Text style={styles.statValue}>{statValue}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEvolutionTab = () => {
    if (isLoadingSpecies || isLoadingEvolution || isParsingEvolution) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>Loading evolution data...</Text>
        </View>
      );
    }
    
    if (!speciesUrl) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>Species URL not available</Text>
        </View>
      );
    }
    
    if (!species) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>Species data not available</Text>
        </View>
      );
    }
    
    if (!evolutionChainUrl) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>Evolution chain URL not found in species data</Text>
        </View>
      );
    }
    
    if (!evolutionChainData) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>Evolution chain data not loaded</Text>
        </View>
      );
    }
    
    if (evolutionChain.length === 0 && !isParsingEvolution) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noEvolutionText}>No evolution chain available for this Pokémon</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {evolutionChain.map((evolution, index) => (
          <View key={evolution.id}>
            <View style={styles.evolutionCard}>
              <PokemonImage id={evolution.id} size={80} variant="pixelated" />
              <View style={styles.evolutionInfo}>
                <View style={styles.evolutionIdBadge}>
                  <Text style={styles.evolutionIdText}>{evolution.id.toString().padStart(3, '0')}</Text>
                </View>
                <Text style={styles.evolutionName}>
                  {evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)}
                </Text>
              </View>
            </View>
            {index < evolutionChain.length - 1 && (
              <View style={styles.evolutionConnector}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={styles.evolutionDot} />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (Platform.OS === 'android') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const types = pokemon.types.map(t => t.type.name).join(', ');
      const shareMessage = `Check out ${pokemonDisplayName}! 🎮\n\n` +
        `#${formattedId}\n` +
        `Type: ${types}\n` +
        `Height: ${heightInMeters}m | Weight: ${weightInKg}kg\n` +
        `Base XP: ${baseExperience}\n\n` +
        `${imageUrl}`;

      const result = await Share.share({
        message: shareMessage,
        title: `${pokemonDisplayName} - Pokédex`,
        url: imageUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share Pokémon');
      console.error('Share error:', error);
    }
  };

  const handleSwipe = (event: any) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.ACTIVE) {
      translateX.setValue(translationX);
    } else if (state === State.END) {
      const tabs: TabType[] = ['about', 'stats', 'evolution'];
      const currentIndex = tabs.indexOf(activeTab);

      if (translationX < -50 && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else if (translationX > 50 && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      Animated.spring(translateX, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
        
        <View style={styles.headerRight}>
          <View style={styles.headerActions}>
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color="#212121" />
            </Pressable>
            <FavoriteHeader
              pokemonId={pokemon.id}
              pokemonName={pokemon.name}
              imageUrl={imageUrl}
            />
          </View>
          <Text style={styles.headerId}>{formattedId}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.nameContainer}>
          <Text style={styles.pokemonName}>{pokemonDisplayName}</Text>
        </View>

        <View style={styles.typeContainer}>
          {pokemon.types.map((typeInfo, index) => {
            const typeColor = getTypeCircleColor(typeInfo.type.name);
            return (
              <View key={index} style={styles.typeTag}>
                <View style={[styles.typeCircle, { backgroundColor: typeColor }]} />
                <Text style={styles.typeText}>
                  {typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.imageContainer}>
          <PokemonImage id={pokemon.id} size={280} />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('about')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              About
            </Text>
            {activeTab === 'about' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('stats')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
            {activeTab === 'stats' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('evolution')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'evolution' && styles.tabTextActive]}>
              Evolution
            </Text>
            {activeTab === 'evolution' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>
        <View style={styles.tabSeparator} />

        <PanGestureHandler
          onHandlerStateChange={handleSwipe}
          activeOffsetX={[-10, 10]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  translateX: Animated.add(
                    translateX,
                    tabAnimatedValue.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [0, -SCREEN_WIDTH, -SCREEN_WIDTH * 2],
                    })
                  ),
                },
              ],
              flexDirection: 'row',
              width: SCREEN_WIDTH * 3,
            }}
          >
            <Animated.View
              style={{
                width: SCREEN_WIDTH,
                opacity: tabAnimatedValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.3, 0],
                }),
              }}
            >
              {renderAboutTab()}
            </Animated.View>
            <Animated.View
              style={{
                width: SCREEN_WIDTH,
                opacity: tabAnimatedValue.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, 1, 0],
                }),
              }}
            >
              {renderStatsTab()}
            </Animated.View>
            <Animated.View
              style={{
                width: SCREEN_WIDTH,
                opacity: tabAnimatedValue.interpolate({
                  inputRange: [1, 1.5, 2],
                  outputRange: [0, 0.3, 1],
                }),
              }}
            >
              {renderEvolutionTab()}
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    padding: 4,
  },
  headerId: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#A4A4A4',
    marginTop: 4,
  },
  nameContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  pokemonName: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: '#212121',
    textTransform: 'capitalize',
  },
  typeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#212121',
    textTransform: 'capitalize',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#A4A4A4',
  },
  tabTextActive: {
    fontFamily: Fonts.semiBold,
    color: '#212121',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6C79DB',
    marginHorizontal: 8,
  },
  tabSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  detailKey: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#212121',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#212121',
    textTransform: 'capitalize',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#212121',
    width: 100,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    justifyContent: 'center',
  },
  statBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#6C79DB',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#A4A4A4',
    width: 40,
    textAlign: 'right',
  },
  evolutionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  evolutionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  evolutionIdBadge: {
    backgroundColor: '#6C79DB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  evolutionIdText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  evolutionName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#212121',
    textTransform: 'capitalize',
  },
  evolutionConnector: {
    alignItems: 'center',
    marginVertical: 8,
    flexDirection: 'column',
    gap: 4,
  },
  evolutionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: '#212121',
  },
  noEvolutionText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#A4A4A4',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
