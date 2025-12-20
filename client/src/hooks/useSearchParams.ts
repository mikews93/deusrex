import { useSearchParams as useRouterSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * Generic type for filter objects that can be used with search parameters
 */
export type SearchParamsFilter = Record<string, any>;

/**
 * Configuration options for the useSearchParams hook
 */
export interface UseSearchParamsConfig<T extends SearchParamsFilter> {
  /**
   * Default values for the filters
   */
  defaults?: Partial<T>;

  /**
   * Keys to exclude from the URL (e.g., 'paginated', 'page', 'limit')
   */
  excludeFromUrl?: (keyof T)[];

  /**
   * Custom parsers for specific keys (e.g., converting strings to numbers)
   */
  parsers?: {
    [K in keyof T]?: (value: string) => T[K];
  };

  /**
   * Custom serializers for specific keys (e.g., converting objects to strings)
   */
  serializers?: {
    [K in keyof T]?: (value: T[K]) => string;
  };
}

/**
 * Custom hook for managing search parameters with type safety and reusability
 *
 * @param config Configuration object for the hook
 * @returns Object with current filters, update function, and helper methods
 */
export function useSearchParams<T extends SearchParamsFilter>(
  config: UseSearchParamsConfig<T> = {}
) {
  const [searchParams, setSearchParams] = useRouterSearchParams();

  const {
    defaults = {},
    excludeFromUrl = [],
    parsers = {},
    serializers = {},
  } = config;

  /**
   * Get current filters from URL parameters
   */
  const filters = useMemo((): T => {
    const params = Object.fromEntries(searchParams.entries());
    const result = { ...defaults } as T;

    // Parse each parameter
    Object.entries(params).forEach(([key, value]) => {
      const typedKey = key as keyof T;

      // Skip excluded keys
      if (excludeFromUrl.includes(typedKey)) {
        return;
      }

      // Use custom parser if available, otherwise use default parsing
      if ((parsers as any)[typedKey]) {
        try {
          (result as any)[typedKey] = (parsers as any)[typedKey](value);
        } catch (error) {
          console.warn(`Failed to parse parameter ${key}:`, error);
        }
      } else {
        // Default parsing logic
        if (value === "true") {
          (result as any)[typedKey] = true;
        } else if (value === "false") {
          (result as any)[typedKey] = false;
        } else if (!isNaN(Number(value)) && value !== "") {
          (result as any)[typedKey] = Number(value);
        } else if (value === "") {
          (result as any)[typedKey] = undefined;
        } else {
          (result as any)[typedKey] = value;
        }
      }
    });

    return result;
  }, [searchParams, defaults, excludeFromUrl, parsers]);

  /**
   * Update search parameters with new filter values
   */
  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      const currentParams = Object.fromEntries(searchParams.entries());
      const updatedParams = { ...currentParams };

      // Update parameters with new filter values
      Object.entries(newFilters).forEach(([key, value]) => {
        const typedKey = key as keyof T;

        // Skip excluded keys
        if (excludeFromUrl.includes(typedKey)) {
          return;
        }

        if (value === undefined || value === null || value === "") {
          // Remove parameter if value is empty
          delete updatedParams[key];
        } else {
          // Use custom serializer if available, otherwise use default serialization
          if ((serializers as any)[typedKey]) {
            updatedParams[key] = (serializers as any)[typedKey](value);
          } else {
            updatedParams[key] = String(value);
          }
        }
      });

      setSearchParams(updatedParams);
    },
    [searchParams, setSearchParams, excludeFromUrl, serializers]
  );

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = useCallback(() => {
    const defaultParams: Record<string, string> = {};

    // Only include default values that should be in the URL
    Object.entries(defaults).forEach(([key, value]) => {
      const typedKey = key as keyof T;
      if (
        !excludeFromUrl.includes(typedKey) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if ((serializers as any)[typedKey]) {
          defaultParams[key] = (serializers as any)[typedKey](value);
        } else {
          defaultParams[key] = String(value);
        }
      }
    });

    setSearchParams(defaultParams);
  }, [defaults, excludeFromUrl, serializers, setSearchParams]);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      updateFilters({ [key]: value } as Partial<T>);
    },
    [updateFilters]
  );

  /**
   * Get the raw search parameters object
   */
  const rawParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams]
  );

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    rawParams,
    searchParams,
    setSearchParams,
  };
}
