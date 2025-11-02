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
      const response = await PokeApiService.listPokemons(pageParam, limit);
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

export const useAllPokemonForSearch = () => {
  return useQuery({
    queryKey: ['all-pokemon'],
    queryFn: async () => {
      const response = await PokeApiService.listPokemons(0, 10000);
      return {
        ...response,
        results: response.results.map(mapWithResourceId),
      };
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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

export const usePokemonSpecies = (speciesUrl: string | null) => {
  return useQuery({
    queryKey: ['pokemon-species', speciesUrl],
    queryFn: async () => {
      if (!speciesUrl) throw new Error('No species URL');
      
      try {
        const match = speciesUrl.match(/\/pokemon-species\/(\d+)\//);
        if (match) {
          const id = parseInt(match[1], 10);
          try {
            return await PokeApiService.getPokemonSpeciesById(id);
          } catch {
            const response = await fetch(speciesUrl);
            if (!response.ok) throw new Error('Failed to fetch species');
            return await response.json();
          }
        }
        
        const nameMatch = speciesUrl.match(/\/pokemon-species\/([^/]+)\/?$/);
        if (nameMatch) {
          try {
            return await PokeApiService.getPokemonSpeciesByName(nameMatch[1]);
          } catch {
            const response = await fetch(speciesUrl);
            if (!response.ok) throw new Error('Failed to fetch species');
            return await response.json();
          }
        }
        
        const response = await fetch(speciesUrl);
        if (!response.ok) throw new Error('Failed to fetch species');
        return await response.json();
      } catch (error) {
        console.error('Error fetching species:', error);
        throw error;
      }
    },
    enabled: !!speciesUrl,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEvolutionChain = (evolutionChainUrl: string | null) => {
  return useQuery({
    queryKey: ['evolution-chain', evolutionChainUrl],
    queryFn: async () => {
      if (!evolutionChainUrl) throw new Error('No evolution chain URL');
      
      const response = await fetch(evolutionChainUrl);
      if (!response.ok) throw new Error('Failed to fetch evolution chain');
      return await response.json();
    },
    enabled: !!evolutionChainUrl,
    staleTime: 10 * 60 * 1000,
  });
};

