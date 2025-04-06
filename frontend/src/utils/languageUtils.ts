interface LanguageConfig {
  typeExamples: Record<string, string>;
  parseValue: (value: string, type: string) => any;
  formatValue: (value: any) => string;
}

const pythonConfig: LanguageConfig = {
  typeExamples: {
    'List[int]': '[1, 2, 3]',
    'List[str]': '["a", "b", "c"]',
    'List[float]': '[1.0, 2.5, 3.7]',
    'int': '42',
    'str': '"hello"',
    'float': '3.14',
    'bool': 'True',
    'Dict[str, int]': '{"key": 1}',
    'Set[int]': '{1, 2, 3}',
    'Tuple[int, int]': '(1, 2)'
  },

  parseValue: (value: string, type: string): any => {
    try {
      // Handle arrays
      if (type.startsWith('List[')) {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error('Expected an array');
        }
        return parsed;
      }
      
      // Handle basic types
      switch (type) {
        case 'int':
          const num = Number(value);
          if (!Number.isInteger(num)) {
            throw new Error('Expected an integer');
          }
          return num;
        case 'float':
          const float = Number(value);
          if (isNaN(float)) {
            throw new Error('Expected a number');
          }
          return float;
        case 'bool':
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          throw new Error('Expected true or false');
        case 'str':
          // Remove quotes if they exist
          return value.replace(/^["'](.*)["']$/, '$1');
        default:
          // For other types (Dict, Set, etc.), try JSON parse
          return JSON.parse(value);
      }
    } catch (error) {
      console.error(`Error parsing value for type ${type}:`, error);
      return value; // Return as-is if parsing fails
    }
  },

  formatValue: (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return `[${value.map(v => pythonConfig.formatValue(v)).join(', ')}]`;
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
};

// In the future, we can add more language configs here
// const javascriptConfig: LanguageConfig = { ... };
// const javaConfig: LanguageConfig = { ... };

// For now, we'll export the Python config as the default
export const currentLanguageConfig = pythonConfig;

// Export the interface for type checking
export type { LanguageConfig }; 