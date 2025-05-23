import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRecoilState } from 'recoil';
import { problemStatementAtom } from '../recoil';

interface ProblemDescriptionProps {
  isInterviewer: boolean;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  isInterviewer
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [problemStatement, setProblemStatement] = useRecoilState(problemStatementAtom);
  const [editedProblem, setEditedProblem] = useState(problemStatement);

  const handleSave = () => {
    setProblemStatement(editedProblem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProblem(problemStatement);
    setIsEditing(false);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      color: '#CCCCCC'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 2,
        py: 1,
        borderBottom: '1px solid #404040',
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#CCCCCC',
            fontSize: '1rem',
            fontFamily: 'Consolas, Monaco, monospace',
            fontWeight: 400
          }}
        >
          Problem Description
        </Typography>
        {isInterviewer && !isEditing && (
          <Button
            startIcon={<EditIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => setIsEditing(true)}
            size="small"
            sx={{
              color: '#CCCCCC',
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Edit
          </Button>
        )}
      </Box>
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        px: 2,
        py: 1
      }}>
        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <TextField
              multiline
              fullWidth
              minRows={10}
              value={editedProblem}
              onChange={(e) => setEditedProblem(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: '#2D2D2D',
                  color: '#CCCCCC',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.9rem'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#404040'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#606060'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#808080'
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                size="small"
                sx={{
                  color: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: '#4CAF50',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#45a049'
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ 
            whiteSpace: 'pre-line',
            color: '#CCCCCC',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}>
            {problemStatement}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProblemDescription; 