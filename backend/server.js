const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocketServer = require('./websocket');
const { runPythonCode } = require('./pythonRunner');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

app.use(cors());
app.use(express.json());

// Execute Python code endpoint
app.post('/execute', async (req, res) => {
  const { code, testCases } = req.body;
  try {
    const results = await runPythonCode(code, testCases);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 