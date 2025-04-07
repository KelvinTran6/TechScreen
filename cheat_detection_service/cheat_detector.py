#!/usr/bin/env python3
"""
Module for detecting potential cheating in candidate code.
"""
import re
import json

class CheatDetector:
    """
    Class for detecting potential cheating in candidate code.
    """
    
    def __init__(self):
        """Initialize the cheat detector."""
        # Common patterns that might indicate cheating
        self.suspicious_patterns = [
            r'https?://\S+',  # URLs
            r'github\.com/\S+',  # GitHub links
            r'stackoverflow\.com/\S+',  # Stack Overflow links
            r'copied from',  # Explicit mentions of copying
            r'found on',  # Explicit mentions of finding code
            r'from the internet',  # Explicit mentions of internet
            r'from online',  # Explicit mentions of online
            r'from a website',  # Explicit mentions of website
        ]
        
        # Compile the patterns for better performance
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.suspicious_patterns]
    
    def check_code(self, problem_statement, candidate_code, language):
        """
        Check if the candidate's code might be cheating.
        
        Args:
            problem_statement (str): The problem statement
            candidate_code (str): The candidate's code
            language (str): The programming language used
            
        Returns:
            dict: A dictionary with the result of the check
        """
        # For now, just print the received data
        print("Checking code for cheating:")
        print(f"Problem Statement: {problem_statement}")
        print(f"Candidate Code: {candidate_code}")
        print(f"Language: {language}")
        
        # Check for suspicious patterns
        suspicious_matches = []
        for pattern in self.compiled_patterns:
            matches = pattern.findall(candidate_code)
            if matches:
                suspicious_matches.extend(matches)
        
        # Determine if cheating is detected
        is_cheating = len(suspicious_matches) > 0
        confidence = min(1.0, len(suspicious_matches) * 0.2)  # Simple confidence score
        
        # Generate explanation
        if is_cheating:
            explanation = f"Potential cheating detected. Found suspicious patterns: {', '.join(suspicious_matches)}"
        else:
            explanation = "No obvious signs of cheating detected."
        
        # Return the result
        return {
            "is_cheating": is_cheating,
            "confidence": confidence,
            "explanation": explanation,
            "suspicious_patterns": suspicious_matches
        } 