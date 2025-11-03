import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Dimensions,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePokemonByName, usePokemonList } from '@/hooks/use-pokemon';
import { Fonts } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BattlePokemon {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite: string;
  spriteBack: string;
  types: string[];
}

const getTypeColor = (typeName: string): string => {
  const typeColors: { [key: string]: string } = {
    electric: '#F7D02C',
    fire: '#FF6B35',
    water: '#4A90E2',
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
  return typeColors[typeName.toLowerCase()] || '#A8A878';
};

const getRandomOpponent = (): number => {
  return Math.floor(Math.random() * 898) + 1;
};

const calculateDamage = (attacker: BattlePokemon, defender: BattlePokemon): number => {
  const baseDamage = Math.floor((attacker.attack / defender.defense) * 20);
  const randomFactor = 0.85 + Math.random() * 0.3;
  return Math.max(Math.floor(baseDamage * randomFactor), 5);
};

export default function BattleScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [playerPokemonName, setPlayerPokemonName] = useState<string>(name as string);
  const [opponentId, setOpponentId] = useState<number>(() => getRandomOpponent());
  
  const { data: pokemonData } = usePokemonByName(playerPokemonName);
  const { data: opponentData } = usePokemonByName(String(opponentId));
  
  // Fetch all Pokemon for selection
  const {
    data: pokemonListData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonList(20);

  const [playerPokemon, setPlayerPokemon] = useState<BattlePokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<BattlePokemon | null>(null);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [battleInitialized, setBattleInitialized] = useState(false);

  const playerShake = useRef(new Animated.Value(0)).current;
  const opponentShake = useRef(new Animated.Value(0)).current;
  const playerSlide = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const opponentSlide = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const battleResultOpacity = useRef(new Animated.Value(0)).current;

  // Create available Pokemon list from fetched data
  const availablePokemon = React.useMemo(() => {
    const allPokemon = (pokemonListData?.pages || []).flatMap((page) =>
      page.results.map((item) => ({
        id: parseInt(item.id, 10),
        name: item.name,
      }))
    );

    // Remove duplicates
    const uniquePokemon = Array.from(
      new Map(allPokemon.map((p) => [p.id, p])).values()
    );

    return uniquePokemon;
  }, [pokemonListData]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (pokemonData && opponentData && !battleInitialized) {
      const player: BattlePokemon = {
        id: pokemonData.id,
        name: pokemonData.name,
        hp: pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 100,
        maxHp: pokemonData.stats.find(s => s.stat.name === 'hp')?.base_stat || 100,
        attack: pokemonData.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
        defense: pokemonData.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
        speed: pokemonData.stats.find(s => s.stat.name === 'speed')?.base_stat || 50,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`,
        spriteBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonData.id}.png`,
        types: pokemonData.types.map(t => t.type.name),
      };

      const opponent: BattlePokemon = {
        id: opponentData.id,
        name: opponentData.name,
        hp: opponentData.stats.find(s => s.stat.name === 'hp')?.base_stat || 100,
        maxHp: opponentData.stats.find(s => s.stat.name === 'hp')?.base_stat || 100,
        attack: opponentData.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
        defense: opponentData.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
        speed: opponentData.stats.find(s => s.stat.name === 'speed')?.base_stat || 50,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${opponentData.id}.png`,
        spriteBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${opponentData.id}.png`,
        types: opponentData.types.map(t => t.type.name),
      };

      setPlayerPokemon(player);
      setOpponentPokemon(opponent);
      const firstTurn = player.speed >= opponent.speed ? 'player' : 'opponent';
      setTurn(firstTurn);
      setBattleInitialized(true);
      
      Animated.parallel([
        Animated.spring(playerSlide, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(opponentSlide, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // If opponent goes first, trigger their attack after animations complete
        if (firstTurn === 'opponent') {
          setTimeout(() => {
            setIsAnimating(true);
            const damage = calculateDamage(opponent, player);
            const newPlayerHp = Math.max(0, player.hp - damage);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            shakeAnimation(playerShake).start(() => {
              setPlayerPokemon({ ...player, hp: newPlayerHp });
              setBattleLog([`${opponent.name} dealt ${damage} damage!`]);

              if (newPlayerHp <= 0) {
                handleDefeat();
              } else {
                setTurn('player');
                setIsAnimating(false);
              }
            });
          }, 1000);
        }
      });
    }
  }, [pokemonData, opponentData, battleInitialized]);

  const shakeAnimation = (animValue: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(animValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  };

  const handleVictory = useCallback(() => {
    setBattleEnded(true);
    setIsAnimating(false);
    const points = 100;
    setScore(prev => prev + points);
    setWins(prev => prev + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBattleLog(prev => [...prev, `Victory! +${points} points!`]);
    
    // Fade in victory overlay
    Animated.timing(battleResultOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [battleResultOpacity]);

  const handleDefeat = useCallback(() => {
    setBattleEnded(true);
    setIsAnimating(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setBattleLog(prev => [...prev, `Defeat!`]);
    
    // Fade in defeat overlay
    Animated.timing(battleResultOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [battleResultOpacity]);

  const opponentTurn = useCallback((currentOpponentHp: number) => {
    if (!playerPokemon || !opponentPokemon) return;

    setTurn('opponent');
    const damage = calculateDamage({ ...opponentPokemon, hp: currentOpponentHp }, playerPokemon);
    const newPlayerHp = Math.max(0, playerPokemon.hp - damage);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    shakeAnimation(playerShake).start(() => {
      setPlayerPokemon(prev => prev ? { ...prev, hp: newPlayerHp } : null);
      setBattleLog(prev => [...prev, `${opponentPokemon.name} dealt ${damage} damage!`]);

      if (newPlayerHp <= 0) {
        handleDefeat();
      } else {
        setTurn('player');
        setIsAnimating(false);
      }
    });
  }, [playerPokemon, opponentPokemon, playerShake, handleDefeat]);

  const handleAttack = useCallback(() => {
    if (!playerPokemon || !opponentPokemon || isAnimating || battleEnded || turn !== 'player') return;

    setIsAnimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const damage = calculateDamage(playerPokemon, opponentPokemon);
    const newOpponentHp = Math.max(0, opponentPokemon.hp - damage);

    shakeAnimation(opponentShake).start(() => {
      setOpponentPokemon(prev => prev ? { ...prev, hp: newOpponentHp } : null);
      setBattleLog(prev => [...prev, `${playerPokemon.name} dealt ${damage} damage!`]);

      if (newOpponentHp <= 0) {
        handleVictory();
      } else {
        setTimeout(() => opponentTurn(newOpponentHp), 1000);
      }
    });
  }, [playerPokemon, opponentPokemon, isAnimating, battleEnded, turn, opponentShake, handleVictory, opponentTurn]);

  const handleNextBattle = useCallback(() => {
    // Reset battle state
    setBattleEnded(false);
    setIsAnimating(false);
    setBattleLog([]);
    setBattleInitialized(false);
    
    // Reset animations
    playerSlide.setValue(-SCREEN_WIDTH);
    opponentSlide.setValue(SCREEN_WIDTH);
    playerShake.setValue(0);
    opponentShake.setValue(0);
    
    // Generate new opponent
    setOpponentId(getRandomOpponent());
  }, [playerSlide, opponentSlide, playerShake, opponentShake]);

  if (!playerPokemon || !opponentPokemon) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Preparing Battle...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#212121" />
            <Text style={styles.backText}>Details</Text>
          </Pressable>
        </View>

        {/* Battle Arena with Background Image */}
        <ImageBackground 
          source={require('@/assets/images/battle_background.jpg')}
          style={styles.battleArenaBackground}
          imageStyle={styles.battleArenaBackgroundImage}
        >
          <View style={styles.battleArena}>
            {/* Pokemon Sprites */}
            <View style={styles.pokemonContainer}>
              <Animated.View style={[styles.playerPokemonWrapper, { transform: [{ translateX: playerSlide }, { translateX: playerShake }] }]}>
                <Image source={{ uri: playerPokemon.spriteBack }} style={styles.playerSprite} />
              </Animated.View>
              
              <Animated.View style={[styles.opponentPokemonWrapper, { transform: [{ translateX: opponentSlide }, { translateX: opponentShake }] }]}>
                <Image source={{ uri: opponentPokemon.sprite }} style={styles.opponentSprite} />
              </Animated.View>
            </View>

            {/* Battle Result Overlay */}
            {battleEnded && (
              <Animated.View 
                style={[
                  styles.battleResultOverlay,
                  {
                    backgroundColor: playerPokemon.hp > 0 ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                    opacity: battleResultOpacity,
                  }
                ]}
              >
                <Text style={styles.battleResultText}>
                  {playerPokemon.hp > 0 ? 'Victory!' : 'Defeat!'}
                </Text>
                <Text style={styles.battleResultScore}>Score: {score}</Text>
                <Text style={styles.battleResultSubtext}>
                  {playerPokemon.hp > 0 ? 'Select your next opponent below' : 'Select a new opponent to continue'}
                </Text>
              </Animated.View>
            )}
          </View>
        </ImageBackground>

        {/* Info Cards - Single White Background */}
        <View style={styles.infoSection}>
          <View style={styles.infoCardsContainer}>
            {/* Player Info */}
            <View style={styles.pokemonInfo}>
              <Text style={styles.cardPokemonName}>{playerPokemon.name.charAt(0).toUpperCase() + playerPokemon.name.slice(1)}</Text>
              <View style={styles.typeIconsContainer}>
                {playerPokemon.types.map((type, index) => (
                  <View key={index} style={[styles.typeIcon, { backgroundColor: getTypeColor(type) }]} />
                ))}
              </View>
            </View>

            {/* HP Display */}
            <View style={styles.hpDisplayContainer}>
              <View style={styles.hpBox}>
                <Text style={styles.hpNumber}>{playerPokemon.hp}</Text>
              </View>
              <Text style={styles.hpSeparator}>:</Text>
              <View style={styles.hpBox}>
                <Text style={styles.hpNumber}>{opponentPokemon.hp}</Text>
              </View>
            </View>

            {/* Opponent Info */}
            <View style={styles.pokemonInfo}>
              <Text style={styles.cardPokemonName}>{opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)}</Text>
              <View style={styles.typeIconsContainer}>
                {opponentPokemon.types.map((type, index) => (
                  <View key={index} style={[styles.typeIcon, { backgroundColor: getTypeColor(type) }]} />
                ))}
              </View>
            </View>
          </View>
        </View>

          {/* Bottom Selection Panel */}
          <View style={styles.bottomPanel}>
            <Text style={styles.panelTitle}>Select your opponent</Text>

            {/* Pokemon List */}
            <ScrollView 
              style={styles.pokemonList}
              contentContainerStyle={styles.pokemonListContent}
              showsVerticalScrollIndicator={false}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
                if (isCloseToBottom) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              {availablePokemon.map((pokemon) => (
                <Pressable 
                  key={pokemon.id}
                  style={[
                    styles.pokemonItem,
                    opponentPokemon?.id === pokemon.id && styles.selectedPokemonItem
                  ]}
                  onPress={() => {
                    if (isAnimating) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      return;
                    }
                    
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    
                    // Fade out battle result overlay
                    Animated.timing(battleResultOpacity, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    }).start(() => {
                      // Select new opponent after fade out
                      setOpponentId(pokemon.id);
                      setBattleEnded(false);
                      setIsAnimating(false);
                      setBattleLog([]);
                      setBattleInitialized(false);
                      playerSlide.setValue(-SCREEN_WIDTH);
                      opponentSlide.setValue(SCREEN_WIDTH);
                      playerShake.setValue(0);
                      opponentShake.setValue(0);
                    });
                  }}
                >
                  <Image 
                    source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png` }}
                    style={styles.pokemonItemSprite}
                  />
                  <View style={styles.pokemonItemInfo}>
                    <View style={styles.pokemonIdBadge}>
                      <Text style={styles.pokemonIdText}>{pokemon.id.toString().padStart(3, '0')}</Text>
                    </View>
                    <Text style={styles.pokemonItemName}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
                  </View>
                </Pressable>
              ))}
              {isFetchingNextPage && (
                <View style={styles.loadingMoreContainer}>
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              )}
            </ScrollView>

            {/* Attack Button - Only during battle */}
            {!battleEnded && (
              <View style={styles.actionButtonsContainer}>
                <Pressable 
                  style={[styles.attackButton, (turn !== 'player' || isAnimating) && styles.disabledButton]} 
                  onPress={handleAttack}
                  disabled={turn !== 'player' || isAnimating}
                >
                  <Ionicons name="flash" size={24} color="#FFFFFF" />
                  <Text style={styles.attackButtonText}>
                    {turn === 'player' ? 'Attack!' : "Opponent's turn..."}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#212121',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: '#212121',
  },
  battleArenaBackground: {
    height: 280,
    justifyContent: 'center',
  },
  battleArenaBackgroundImage: {
    resizeMode: 'center',
  },
  battleArena: {
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  battleResultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  battleResultText: {
    fontSize: 48,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  battleResultScore: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  battleResultSubtext: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  pokemonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  playerPokemonWrapper: {
    alignItems: 'center',
  },
  opponentPokemonWrapper: {
    alignItems: 'center',
  },
  playerSprite: {
    width: 150,
    height: 150,
  },
  opponentSprite: {
    width: 150,
    height: 150,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pokemonInfo: {
    flex: 1,
    alignItems: 'center',
  },
  cardPokemonName: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#212121',
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  typeIconsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hpDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hpBox: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  hpNumber: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  hpSeparator: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#212121',
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#212121',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  pokemonList: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 150,
  },
  pokemonListContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  pokemonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPokemonItem: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  pokemonItemSprite: {
    width: 60,
    height: 60,
  },
  pokemonItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  pokemonIdBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  pokemonIdText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  pokemonItemName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#212121',
    textTransform: 'capitalize',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  attackButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  attackButtonText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#A0A0A0',
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#999999',
  },
});

