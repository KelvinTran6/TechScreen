export interface TestCase {
  inputs: any[];
  output: any;
}

export interface TestResult {
  testCase: TestCase;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface Parameter {
  name: string;
  type: string;
  example: string;
} 