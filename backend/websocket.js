const { Server } = require('socket.io');
const { TestCase } = require('./types');

class WebSocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.sessions = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_session', ({ sessionId, role }) => {
        this.handleJoinSession(socket, sessionId, role);
      });

      socket.on('leave_session', ({ sessionId }) => {
        this.handleLeaveSession(socket, sessionId);
      });

      socket.on('code_change', ({ sessionId, code }) => {
        this.handleCodeChange(socket, sessionId, code);
      });

      socket.on('test_case_change', ({ sessionId, testCases }) => {
        this.handleTestCaseChange(socket, sessionId, testCases);
      });

      socket.on('problem_statement_change', ({ sessionId, problemStatement }) => {
        this.handleProblemStatementChange(socket, sessionId, problemStatement);
      });

      socket.on('candidate_activity', ({ sessionId, ...activityData }) => {
        this.handleCandidateActivity(socket, sessionId, activityData);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleJoinSession(socket, sessionId, role) {
    console.log(`Join session request: ${sessionId}, role: ${role}`);
    
    // If the session doesn't exist and the user is an interviewer, create it
    if (!this.sessions.has(sessionId)) {
      if (role === 'interviewer') {
        // Create a new session for the interviewer
        this.sessions.set(sessionId, {
          participants: new Map(),
          code: '',
          testCases: [],
          problemStatement: '',
        });
        console.log(`Created new session: ${sessionId}`);
      } else {
        // This is an invalid session ID for an interviewee
        console.log(`Invalid session ID: ${sessionId}`);
        socket.emit('session_error', { 
          message: `Invalid session ID: ${sessionId}. This session does not exist.` 
        });
        return;
      }
    }

    const session = this.sessions.get(sessionId);
    
    // Check if the user is already in this session
    if (session.participants.has(socket.id)) {
      console.log(`User ${socket.id} is already in session ${sessionId}`);
      return;
    }
    
    // Add the user to the session
    session.participants.set(socket.id, { role });
    socket.join(sessionId);

    console.log(`User ${socket.id} joined session ${sessionId} as ${role}`);
    console.log(`Session ${sessionId} now has ${session.participants.size} participants`);

    // Send current session state to the new participant
    socket.emit('session_state', {
      sessionId,
      role,
      code: session.code,
      testCases: session.testCases,
      problemStatement: session.problemStatement,
    });

    // Notify other participants
    socket.to(sessionId).emit('participant_joined', { role });
  }

  handleLeaveSession(socket, sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.participants.delete(socket.id);
      socket.leave(sessionId);

      // Notify other participants
      socket.to(sessionId).emit('participant_left', { id: socket.id });

      // Clean up empty sessions
      if (session.participants.size === 0) {
        this.sessions.delete(sessionId);
        console.log(`Deleted empty session: ${sessionId}`);
      }
    }
  }

  handleCodeChange(socket, sessionId, code) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.code = code;
      socket.to(sessionId).emit('code_updated', { code });
    }
  }

  handleTestCaseChange(socket, sessionId, testCases) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.testCases = testCases;
      socket.to(sessionId).emit('test_cases_updated', { testCases });
    }
  }

  handleProblemStatementChange(socket, sessionId, problemStatement) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.problemStatement = problemStatement;
      socket.to(sessionId).emit('problem_statement_updated', { problemStatement });
    }
  }

  handleCandidateActivity(socket, sessionId, activityData) {
    console.log(`Received candidate activity for session ${sessionId}:`, activityData);
    
    const session = this.sessions.get(sessionId);
    if (session) {
      console.log(`Session ${sessionId} found, forwarding to interviewers`);
      
      // We need to make sure we're only sending to interviewers
      let interviewerCount = 0;
      for (const [participantId, participant] of session.participants.entries()) {
        if (participant.role === 'interviewer' && participantId !== socket.id) {
          // Get the socket for this participant
          const participantSocket = this.io.sockets.sockets.get(participantId);
          if (participantSocket) {
            console.log(`Forwarding activity to interviewer ${participantId}`);
            // Include the sessionId in the forwarded data
            participantSocket.emit('candidate_activity', {
              ...activityData,
              sessionId
            });
            interviewerCount++;
          } else {
            console.log(`Interviewer ${participantId} socket not found`);
          }
        }
      }
      
      console.log(`Forwarded activity to ${interviewerCount} interviewers`);
    } else {
      console.log(`Session ${sessionId} not found`);
    }
  }

  handleDisconnect(socket) {
    console.log('Client disconnected:', socket.id);
    
    // Find and remove the socket from all sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.participants.has(socket.id)) {
        this.handleLeaveSession(socket, sessionId);
      }
    }
  }
}

module.exports = WebSocketServer; 