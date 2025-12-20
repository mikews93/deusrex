import { isEmpty } from 'lodash';

/**
 * Utility functions for parsing and validating query parameters
 * that come as strings from the frontend but need to be converted to objects
 */

/**
 * Safely parse a JSON string to an object
 * @param jsonString - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeParseJson<T = any>(
  jsonString: string | undefined,
  fallback: T,
): T {
  if (!jsonString) return fallback;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON string:', jsonString, error);
    return fallback;
  }
}

/**
 * Parse the 'with' parameter from string to object
 * @param withString - The 'with' parameter as a JSON string
 * @returns Parsed with object or empty object
 */
export function parseWithParameter(withString?: string): Record<string, any> {
  return safeParseJson(withString, {});
}

/**
 * Parse the 'columns' parameter from string to object
 * @param columnsString - The 'columns' parameter as a JSON string
 * @returns Parsed columns object or empty object
 */
export function parseColumnsParameter(
  columnsString?: string,
): Record<string, any> {
  return safeParseJson(columnsString, {});
}

/**
 * Validate that the parsed 'with' object has valid structure
 * Supports nested 'with' objects for complex relationships
 * @param withObj - The parsed 'with' object
 * @returns Validated 'with' object
 */
export function validateWithParameter(
  withObj: Record<string, any>,
): Record<string, any> {
  if (typeof withObj !== 'object' || withObj === null) {
    return {};
  }

  const validated: Record<string, any> = {};

  for (const [key, value] of Object.entries(withObj)) {
    if (typeof value === 'boolean') {
      // Simple boolean values (e.g., { client: true })
      validated[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Nested objects with their own 'with' properties
      // e.g., { saleItems: { with: { product: true, service: true } } }
      const nestedValidated: Record<string, any> = {};

      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (
          nestedKey === 'with' &&
          typeof nestedValue === 'object' &&
          nestedValue !== null
        ) {
          // Recursively validate nested 'with' objects
          nestedValidated[nestedKey] = validateWithParameter(nestedValue);
        } else if (typeof nestedValue === 'boolean') {
          // Other boolean properties in nested objects
          nestedValidated[nestedKey] = nestedValue;
        }
      }

      if (Object.keys(nestedValidated).length > 0) {
        validated[key] = nestedValidated;
      }
    }
  }

  return validated;
}

/**
 * Validate that the parsed 'columns' object has valid structure
 * @param columnsObj - The parsed 'columns' object
 * @returns Validated 'columns' object
 */
export function validateColumnsParameter(
  columnsObj: Record<string, any>,
): Record<string, any> {
  if (typeof columnsObj !== 'object' || columnsObj === null) {
    return {};
  }

  // Ensure all values are boolean
  const validated: Record<string, any> = {};
  for (const [key, value] of Object.entries(columnsObj)) {
    if (typeof value === 'boolean') {
      validated[key] = value;
    }
  }

  return validated;
}

/**
 * Parse and validate both 'with' and 'columns' parameters
 * @param withString - The 'with' parameter as a JSON string
 * @param columnsString - The 'columns' parameter as a JSON string
 * @returns Object with validated with and columns
 */
export function parseQueryParameters(
  withString?: string,
  columnsString?: string,
) {
  const withObj = parseWithParameter(withString);
  const columnsObj = parseColumnsParameter(columnsString);
  const validatedWith = validateWithParameter(withObj);
  const validatedColumns = validateColumnsParameter(columnsObj);

  const result: Record<string, any> = {};
  if (!isEmpty(validatedWith)) {
    result.with = validatedWith;
  }
  if (!isEmpty(validatedColumns)) {
    result.columns = validatedColumns;
  }
  return result;
}
