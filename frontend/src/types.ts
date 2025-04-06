export interface TestCase {
  inputs: any[];
  output: any;
  description?: string;
}

export interface TestResult {
  testCase: TestCase;
  actualOutput: string;
  passed: boolean;
  error: string | null;
}

export interface Parameter {
  name: string;
  type: string;
  description?: string;
  example?: string;
} 