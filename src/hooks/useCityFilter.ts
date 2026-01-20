/**
 * ============================================================
 * CITY FILTER HOOK
 * ============================================================
 * Custom hook for extracting unique cities from creators
 * and providing city-based filtering utilities.
 * 
 * Following Non-Invasive Pattern: This hook can be used in
 * any component without modifying core files.
 * ============================================================
 */

import { useMemo } from 'react';
import { Creator } from '@/types/creator';

/**
 * Extract unique cities from a list of creators
 * Sorted alphabetically, with null/empty filtered out
 */
export function getUniqueCities(creators: Creator[]): string[] {
    const cities = creators
        .map(c => c.city)
        .filter((city): city is string => !!city && city.trim() !== '');

    return [...new Set(cities)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Extract unique states (UFs) from a list of creators
 */
export function getUniqueStates(creators: Creator[]): string[] {
    const states = creators
        .map(c => c.state)
        .filter((state): state is string => !!state && state.trim() !== '');

    return [...new Set(states)].sort();
}

/**
 * Filter creators by city (case-insensitive, partial match)
 */
export function filterByCity(creators: Creator[], city: string): Creator[] {
    if (!city || city.trim() === '') return creators;

    const normalizedCity = city.toLowerCase().trim();
    return creators.filter(c =>
        c.city?.toLowerCase().includes(normalizedCity)
    );
}

/**
 * Filter creators by state (exact match)
 */
export function filterByState(creators: Creator[], state: string): Creator[] {
    if (!state || state.trim() === '') return creators;

    return creators.filter(c => c.state === state);
}

/**
 * React hook for city filtering utilities
 * Provides memoized unique cities and filter functions
 */
export function useCityFilter(creators: Creator[]) {
    const uniqueCities = useMemo(
        () => getUniqueCities(creators),
        [creators]
    );

    const uniqueStates = useMemo(
        () => getUniqueStates(creators),
        [creators]
    );

    return {
        uniqueCities,
        uniqueStates,
        filterByCity: (city: string) => filterByCity(creators, city),
        filterByState: (state: string) => filterByState(creators, state),
    };
}

export default useCityFilter;
