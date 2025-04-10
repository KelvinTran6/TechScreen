const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runPythonCode(code, testCases) {
  console.log('Running Python code:', code);
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const tempFilePath = path.join(tempDir, 'temp_test.py');

  // Build Python code that runs the function and prints output
  const testCode = `
import json
from typing import List, Dict, Set, Tuple, Any

# User's code
user_code = """${code.replace(/`/g, '\\`').replace(/\${/g, '\\${')}"""

# Execute user's code
exec(user_code, globals())

# Get the function name from the code
func_name = None
for line in user_code.split('\\n'):
    if line.strip().startswith('def '):
        func_name = line.split('def ')[1].split('(')[0].strip()
        break

if not func_name:
    raise Exception("No function definition found in code")

# Get the function object
func = globals()[func_name]

# Run all test cases and collect results
results = []
for test_case in ${JSON.stringify(testCases)}:
    try:
        inputs = test_case['inputs']
        output = func(*inputs)  # Unpack the array of inputs as arguments
        
        results.append({
            "testCase": test_case,
            "actualOutput": str(output),
            "passed": str(output) == str(test_case['output']),
            "error": None
        })
    except Exception as e:
        results.append({
            "testCase": test_case,
            "actualOutput": "",
            "passed": False,
            "error": str(e)
        })

print(json.dumps(results))
`;

  try {
    // Write to temp file
    fs.writeFileSync(tempFilePath, testCode);
    console.log('Wrote Python code to:', tempFilePath);

    // Execute the Python code
    const pythonCommand = process.env.PYTHON_PATH || 'python';
    const { stdout, stderr } = await execAsync(`${pythonCommand} "${tempFilePath}"`);
    
    console.log('Python stdout:', stdout);
    if (stderr) {
      console.log('Python stderr:', stderr);
    }

    // Clean up
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.error('Error cleaning up temp file:', e);
    }

    // Parse and return results
    const results = JSON.parse(stdout);
    return results;
  } catch (error) {
    console.error('Python execution error:', error);
    throw new Error(`Python execution failed: ${error.message}`);
  }
}

module.exports = { runPythonCode }; 