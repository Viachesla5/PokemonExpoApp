import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PokemonImage } from './pokemon-image';
import { Fonts } from '@/constants/fonts';

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
};

const PokemonCard = React.memo(({ item, onPress }: PokemonCardProps) => {
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
        <Pressable style={styles.menuButton} hitSlop={8}>
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
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled={!scrollEnabled}
    />
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
});

