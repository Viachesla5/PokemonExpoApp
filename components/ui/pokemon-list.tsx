import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PokemonImage } from './pokemon-image';
import Favorite from './favorite';

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
};

type PokemonCardProps = {
  item: Pokemon;
  onPress: (name: string) => void;
};

const PokemonCard = React.memo(({ item, onPress }: PokemonCardProps) => {
  const formattedId = useMemo(() => item.id.toString().padStart(3, '0'), [item.id]);
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.pokemonCard,
        pressed && styles.pokemonCardPressed,
      ]}
      onPress={() => onPress(item.name)}
    >
      <View style={styles.cardBackground}>
        <View style={styles.topRow}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{formattedId}</Text>
          </View>
          <View style={styles.favoriteContainer}>
            <Favorite
              pokemonId={item.id}
              pokemonName={item.name}
              imageUrl={imageUrl}
            />
          </View>
        </View>
        <View style={styles.imageWrapper}>
          <PokemonImage id={item.id} size={100} />
        </View>
      </View>
      <View style={styles.cardNameSection}>
        <Text style={styles.pokemonName}>{item.name}</Text>
        <Text style={styles.pokemonType}>{item.type}</Text>
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
}: PokemonListProps) {
  const router = useRouter();

  const handlePress = useCallback((pokemonName: string) => {
    router.push(`/pokemon/${pokemonName}`);
  }, [router]);

  const renderPokemonCard = useCallback(({ item }: { item: Pokemon }) => {
    return <PokemonCard item={item} onPress={handlePress} />;
  }, [handlePress]);

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
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pokemonCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pokemonCardPressed: {
    opacity: 0.8,
  },
  cardBackground: {
    backgroundColor: '#E1BEE7',
    aspectRatio: 1.2,
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContainer: {
    zIndex: 2,
  },
  idBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  idText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardNameSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  pokemonType: {
    fontSize: 12,
    color: '#666666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

