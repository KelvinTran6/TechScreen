/**
 * @typedef {Object} TestCase
 * @property {Array<any>} inputs - The input parameters for the test case
 * @property {any} output - The expected output for the test case
 * @property {string} [description] - Optional description of the test case
 */

/**
 * @typedef {Object} TestResult
 * @property {TestCase} testCase - The test case that was run
 * @property {string} actualOutput - The actual output from running the code
 * @property {boolean} passed - Whether the test case passed
 * @property {string|null} error - Error message if the test case failed, null otherwise
 */

/**
 * @typedef {Object} Parameter
 * @property {string} name - The name of the parameter
 * @property {string} type - The type of the parameter
 * @property {string} [description] - Optional description of the parameter
 */

module.exports = {
  TestCase: /** @type {TestCase} */ ({}),
  TestResult: /** @type {TestResult} */ ({}),
  Parameter: /** @type {Parameter} */ ({}),
}; 