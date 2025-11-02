import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Share, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PokemonImage } from './pokemon-image';
import { Fonts } from '@/constants/fonts';
import { useIsFavorite, useToggleFavorite } from '@/hooks/use-favorites';

export type Pokemon = {
  id: number;
  name: string;
  type: string;
};

type PokemonListProps = {
  data: Pokemon[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasNextPage?: boolean;
  scrollEnabled?: boolean;
};

type PokemonCardProps = {
  item: Pokemon;
  onPress: (name: string) => void;
  onMenuPress: (item: Pokemon) => void;
};

const PokemonCard = React.memo(({ item, onPress, onMenuPress }: PokemonCardProps) => {
  const formattedId = useMemo(() => item.id.toString().padStart(3, '0'), [item.id]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pokemonCard,
        pressed && styles.pokemonCardPressed,
      ]}
      onPress={() => onPress(item.name)}
    >
      <View style={styles.cardTop}>
        <View style={styles.idBadge}>
          <Text style={styles.idText}>{formattedId}</Text>
        </View>
        <View style={styles.imageWrapper}>
          <PokemonImage id={item.id} size={160} variant="pixelated" />
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.pokemonName} numberOfLines={1}>{item.name}</Text>
        <Pressable 
          style={styles.menuButton} 
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onMenuPress(item);
          }}
        >
          <View style={styles.menuDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
});

PokemonCard.displayName = 'PokemonCard';

export default function PokemonList({ 
  data, 
  onLoadMore, 
  isLoadingMore = false,
  hasNextPage = false,
  scrollEnabled = true,
}: PokemonListProps) {
  const router = useRouter();
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handlePress = useCallback((pokemonName: string) => {
    router.push(`/pokemon/${pokemonName}`);
  }, [router]);

  const handleMenuPress = useCallback((pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
    setTimeout(() => setSelectedPokemon(null), 200);
  }, []);

  const renderPokemonCard = useCallback(({ item }: { item: Pokemon }) => {
    return <PokemonCard item={item} onPress={handlePress} onMenuPress={handleMenuPress} />;
  }, [handlePress, handleMenuPress]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#9C27B0" />
      </View>
    );
  };

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, isLoadingMore, onLoadMore]);

  const keyExtractor = useCallback((item: Pokemon) => item.name, []);

  return (
    <>
      <FlatList
        data={data}
        renderItem={renderPokemonCard}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={20}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled={!scrollEnabled}
      />
      {selectedPokemon && (
        <PokemonMenu
          pokemon={selectedPokemon}
          visible={menuVisible}
          onClose={closeMenu}
          onNavigate={handlePress}
        />
      )}
    </>
  );
}

type PokemonMenuProps = {
  pokemon: Pokemon;
  visible: boolean;
  onClose: () => void;
  onNavigate: (name: string) => void;
};

function PokemonMenu({ pokemon, visible, onClose, onNavigate }: PokemonMenuProps) {
  const { data: isFavorited } = useIsFavorite(pokemon.id);
  const toggleFavorite = useToggleFavorite();
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const handleOpenPokemon = () => {
    onClose();
    setTimeout(() => onNavigate(pokemon.name), 200);
  };

  const handleToggleFavorite = () => {
    if (Platform.OS === 'ios') {
      if (isFavorited) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    toggleFavorite.mutate({
      pokemonId: pokemon.id,
      name: pokemon.name,
      imageUrl,
      isCurrentlyFavorite: isFavorited || false,
    });
    onClose();
  };

  const handleShare = async () => {
    onClose();
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (Platform.OS === 'android') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const pokemonDisplayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
      const formattedId = pokemon.id.toString().padStart(3, '0');
      const shareMessage = `Check out ${pokemonDisplayName}! 🎮\n\n#${formattedId}\n\n${imageUrl}`;

      await Share.share({
        message: shareMessage,
        title: `${pokemonDisplayName} - Pokédex`,
        url: imageUrl,
      });
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenPokemon}>
            <Ionicons name="open-outline" size={24} color="#000000" />
            <Text style={styles.menuText}>Open Pokémon</Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={handleToggleFavorite}>
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF6B6B" : "#000000"} 
            />
            <Text style={styles.menuText}>
              {isFavorited ? "Remove from favorites" : "Add to favorites"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#000000" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pokemonCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pokemonCardPressed: {
    opacity: 0.7,
  },
  cardTop: {
    backgroundColor: '#E8DEF8',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  idBadge: {
    backgroundColor: '#5631E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  idText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pokemonName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#000000',
    textTransform: 'capitalize',
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  menuDots: {
    flexDirection: 'column',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#000000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 24,
  },
});

