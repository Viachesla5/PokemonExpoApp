import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PokemonSkeleton() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.skeletonTitle, isDark && styles.skeletonDark]} />
        <View style={[styles.skeletonSubtitle, isDark && styles.skeletonDark]} />
      </View>

      <View style={[styles.imageContainer, isDark && styles.imageContainerDark]}>
        <View style={[styles.skeletonImage, isDark && styles.skeletonDark]} />
      </View>

      <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
        <View style={[styles.skeletonSectionTitle, isDark && styles.skeletonDark]} />
        <View style={styles.skeletonTypesContainer}>
          <View style={[styles.skeletonType, isDark && styles.skeletonDark]} />
          <View style={[styles.skeletonType, isDark && styles.skeletonDark]} />
        </View>
      </View>

      <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
        <View style={[styles.skeletonSectionTitle, isDark && styles.skeletonDark]} />
        <View style={styles.skeletonStatsContainer}>
          <View style={[styles.skeletonStat, isDark && styles.skeletonDark]} />
          <View style={[styles.skeletonStat, isDark && styles.skeletonDark]} />
        </View>
      </View>

      <View style={[styles.detailsContainer, isDark && styles.detailsContainerDark]}>
        <View style={[styles.skeletonSectionTitle, isDark && styles.skeletonDark]} />
        <View style={styles.skeletonAbilitiesContainer}>
          <View style={[styles.skeletonAbility, isDark && styles.skeletonDark]} />
          <View style={[styles.skeletonAbility, isDark && styles.skeletonDark]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  skeletonTitle: {
    width: 200,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 80,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  skeletonDark: {
    backgroundColor: '#3A3A3A',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    height: 240,
    justifyContent: 'center',
  },
  imageContainerDark: {
    backgroundColor: '#2A2A3E',
  },
  skeletonImage: {
    width: 200,
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
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
  skeletonSectionTitle: {
    width: 100,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonTypesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonType: {
    width: 80,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
  },
  skeletonStatsContainer: {
    gap: 12,
  },
  skeletonStat: {
    width: '100%',
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  skeletonAbilitiesContainer: {
    gap: 8,
  },
  skeletonAbility: {
    width: '60%',
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
});

