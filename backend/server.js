const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

function runPythonCode(code, testCases, callback) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const tempFilePath = path.join(tempDir, 'temp_test.py');

  // Build Python code that just runs the function and prints output
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

  // Write to temp file
  fs.writeFileSync(tempFilePath, testCode);
  console.log('Wrote Python code to:', tempFilePath);

  // Execute the Python code
  exec(`python "${tempFilePath}"`, (error, stdout, stderr) => {
    console.log('Python stdout:', stdout);
    console.log('Python stderr:', stderr);
    
    // Clean up
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.error('Error cleaning up temp file:', e);
    }

    if (error) {
      console.error('Python execution error:', error);
      return callback({
        error: 'Python execution failed',
        details: error.message,
        stderr: stderr
      }, null);
    }

    try {
      const results = JSON.parse(stdout);
      callback(null, results);
    } catch (e) {
      console.error('Failed to parse Python output:', e);
      callback({
        error: 'Failed to parse Python output',
        details: e.message,
        stdout: stdout,
        stderr: stderr
      }, null);
    }
  });
}

app.post('/execute', (req, res) => {
  const { code, testCases } = req.body;
  console.log('Received code:', code);
  console.log('Received test cases:', testCases);

  runPythonCode(code, testCases, (error, results) => {
    if (error) {
      console.error('Execution error:', error);
      res.status(500).json(error);
    } else {
      console.log('Execution results:', results);
      res.json({ results });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 