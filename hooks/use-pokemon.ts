import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { NamedAPIResource } from 'pokenode-ts';
import { PokeApiService } from '@/services/pokemon-api';

export type PokemonWithId = NamedAPIResource & {
  id: string;
};

export function getPokemonIdFromUrl(url: string): string | null {
  if (!url) return null;

  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? match[1] : null;
}

const mapWithResourceId = (resource: NamedAPIResource): PokemonWithId => {
  const id = getPokemonIdFromUrl(resource.url) || '';
  return {
    id,
    ...resource,
  };
};

export const usePokemonList = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['pokemon-list', limit],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await PokeApiService.listPokemons(limit, pageParam);
      return {
        ...response,
        results: response.results.map(mapWithResourceId),
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * limit;
      return lastPage.next ? nextOffset : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePokemonByName = (name: string) => {
  return useQuery({
    queryKey: ['pokemon', name],
    queryFn: () => PokeApiService.getPokemonByName(name),
    enabled: !!name,
    staleTime: 10 * 60 * 1000,
  });
};

