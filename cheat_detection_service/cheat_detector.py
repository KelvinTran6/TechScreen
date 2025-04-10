#!/usr/bin/env python3
"""
Module for detecting potential cheating in candidate code.
"""
import ast
import astor
import json
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import time

# Load environment variables
load_dotenv()

class CheatDetector:
    """
    Class for detecting potential cheating in candidate code.
    """
    
    def __init__(self):
        self.var_count = 0
        self.var_map = {}
        # Get Hugging Face token from environment variable
        self.hf_token = os.environ.get("HF_TOKEN")
        if not self.hf_token:
            print("Warning: HF_TOKEN environment variable not set. API calls will fail.")
        
        # List of models to try in order of preference
        self.models_to_try = [
            "deepseek-ai/DeepSeek-V3-0324"  # Alternative Python model
            "microsoft/CodeGPT-small-py-adaptedGPT2",  # Fallback Python model
            "openai-community/gpt2",  # Primary code generation model
        ]
        self.current_model_index = 0
        self.model_id = self.models_to_try[0]
        
        # Initialize the InferenceClient
        self.client = InferenceClient(
            token=self.hf_token
        )
        
        print(f"Initialized with model {self.model_id}")
        
        # Test token with a simple request
        if self.hf_token:
            try:
                print("\nTesting token with a simple request...")
                # Use text generation instead of chat completions
                response = self.client.text_generation(
                    "Hello, are you working?",
                    model=self.model_id,
                    max_new_tokens=50
                )
                print("Token is valid and working.")
                print(f"Response: {response}")
            except Exception as e:
                print(f"Error testing token: {e}")

    def _try_next_model(self):
        """Try the next model in the list if current one fails."""
        self.current_model_index = (self.current_model_index + 1) % len(self.models_to_try)
        self.model_id = self.models_to_try[self.current_model_index]
        print(f"Switching to model: {self.model_id}")

    def generate_ai_code(self, problem_statement, language):
        """
        Generate AI code based on the problem statement using the Hugging Face Inference API.
        """
        # Check if token is available
        if not self.hf_token:
            print("Token not available")
            return None
        
        # Format the prompt for code generation with a more specific format
        prompt = f"""
                    class Solution:
                        def longestCommonPrefix(self, strs: List[str]) -> str:
                    
                    Complete the following Solution class. This function should solve the following problem:
                    {problem_statement}
                    
                    Return ONLY the completed function code. Do not include examples, constraints, or explanations.
                    The code should be complete, properly indented, and ready to run.
                    """

        # Try each model until one works
        for _ in range(len(self.models_to_try)):
            try:
                print(f"\nTrying model {self.model_id}...")
                
                # Generate code using text generation with optimized parameters
                print("Using text generation API with optimized parameters...")
                generated_text = self.client.text_generation(
                    prompt,
                    model=self.model_id,
                    max_new_tokens=500,
                    temperature=0.1,  # Lower temperature for more focused output
                    return_full_text=False,
                    do_sample=True,
                    top_p=0.95
                )
                
                if generated_text:
                    print(generated_text)# Clean up the generated text to extract just the code
                    code = self._extract_code_from_text(generated_text)
                    if code:
                        return code
                    else:
                        print("No valid code found in response")
                        self._try_next_model()
                else:
                    print("No code generated in response")
                    self._try_next_model()
                    
            except Exception as e:
                print(f"Error with model {self.model_id}: {e}")
                self._try_next_model()
        
        print("All models failed to generate code")
        return None

    def _extract_code_from_text(self, text):
        """
        Extract code from generated text.
        """
        # Split the text into lines and clean it up
        lines = text.strip().split('\n')
        code_lines = []
        in_function = False
        seen_functions = set()  # Track unique function signatures
        
        # First pass: look for class definitions
        class_lines = []
        in_class = False
        class_indent = 0
        
        for line in lines:
            line = line.rstrip()  # Keep trailing whitespace for indentation
            
            # Skip empty lines
            if not line.strip():
                continue
                
            # Check if this line starts a class definition
            if line.strip().startswith('class '):
                in_class = True
                class_indent = len(line) - len(line.lstrip())
                class_lines = [line]
            # If we're in a class, add the line with proper indentation
            elif in_class:
                # Preserve relative indentation
                indent = len(line) - len(line.lstrip())
                if indent > class_indent:
                    class_lines.append(line)
                else:
                    in_class = False
        
        # If we found a class, use it
        if class_lines:
            return '\n'.join(class_lines)
        
        # Second pass: look for function definitions
        for line in lines:
            line = line.rstrip()  # Keep trailing whitespace for indentation
            
            # Skip empty lines
            if not line.strip():
                continue
                
            # Check if this line starts a function definition
            if line.strip().startswith('def '):
                # Extract function signature
                func_sig = line.strip().split('(')[0]
                
                # If we've seen this function before, skip it
                if func_sig in seen_functions:
                    in_function = False
                    continue
                    
                seen_functions.add(func_sig)
                in_function = True
                func_indent = len(line) - len(line.lstrip())
                code_lines = [line]  # Start fresh with this function
            # If we're in a function, add the line with proper indentation
            elif in_function:
                # Preserve relative indentation
                indent = len(line) - len(line.lstrip())
                if indent > func_indent:
                    # Skip lines that reference undefined variables
                    if 'hash_table' in line and 'hash_table =' not in line:
                        continue
                    code_lines.append(line)
                else:
                    in_function = False
        
        # If we found a function, return it
        if code_lines:
            return '\n'.join(code_lines)
        
        # Third pass: look for code blocks
        code_block = []
        in_code_block = False
        block_indent = 0
        
        for line in lines:
            line = line.rstrip()  # Keep trailing whitespace for indentation
            
            # Skip empty lines
            if not line.strip():
                continue
                
            # Look for code-like patterns
            if any(line.strip().startswith(keyword) for keyword in ['def', 'class', 'if', 'for', 'while', 'return', 'import', 'from']):
                in_code_block = True
                block_indent = len(line) - len(line.lstrip())
                code_block.append(line)
            elif in_code_block and len(line) - len(line.lstrip()) > block_indent:
                code_block.append(line)
            else:
                in_code_block = False
        
        if code_block:
            return '\n'.join(code_block)
        
        # If all else fails, try to extract anything that looks like code
        code_lines = []
        for line in lines:
            line = line.rstrip()  # Keep trailing whitespace for indentation
            if any(line.strip().startswith(keyword) for keyword in ['def', 'class', 'if', 'for', 'while', 'return', 'import', 'from']):
                # Skip lines that reference undefined variables
                if 'hash_table' in line and 'hash_table =' not in line:
                    continue
                code_lines.append(line)
        
        if code_lines:
            return '\n'.join(code_lines)
        
        return None

    def _get_placeholder_code(self, language):
        """Return placeholder code based on language"""
        if language.lower() == "python":
            return """def solution(nums):
    # Find the maximum subarray sum
    max_sum = float('-inf')
    current_sum = 0
    
    for num in nums:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum"""
        elif language.lower() == "javascript":
            return """function solution(nums) {
    // Find the maximum subarray sum
    let maxSum = -Infinity;
    let currentSum = 0;
    
    for (let num of nums) {
        currentSum = Math.max(num, currentSum + num);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}"""
        else:
            return f"// Placeholder code for {language}"

    def normalize_code(self, code):
        """
        Normalize code by replacing variable names, function names, and arguments
        with consistent identifiers to enable semantic comparison.
        """
        class NameNormalizer(ast.NodeTransformer):
            def __init__(self, var_map, var_count):
                self.var_map = var_map
                self.var_count = var_count
                
            def visit_Name(self, node):
                # Skip built-in names and special names
                if node.id in ['True', 'False', 'None', 'print', 'len', 'range', 'int', 'str', 'list', 'dict']:
                    return node
                    
                # Map variable names to consistent identifiers
                if node.id not in self.var_map:
                    self.var_map[node.id] = f"var_{self.var_count}"
                    self.var_count += 1
                node.id = self.var_map[node.id]
                return node
                
            def visit_FunctionDef(self, node):
                # Normalize function name
                if node.name not in self.var_map:
                    self.var_map[node.name] = f"func_{self.var_count}"
                    self.var_count += 1
                node.name = self.var_map[node.name]
                
                # Process function body
                self.generic_visit(node)
                return node
                
            def visit_arg(self, node):
                # Normalize argument names
                if node.arg not in self.var_map:
                    self.var_map[node.arg] = f"arg_{self.var_count}"
                    self.var_count += 1
                node.arg = self.var_map[node.arg]
                return node
                
            def visit_ClassDef(self, node):
                # Normalize class names
                if node.name not in self.var_map:
                    self.var_map[node.name] = f"class_{self.var_count}"
                    self.var_count += 1
                node.name = self.var_map[node.name]
                
                # Process class body
                self.generic_visit(node)
                return node
        
        try:
            # Parse the code into an AST
            tree = ast.parse(code)
            
            # Create and apply the normalizer
            normalizer = NameNormalizer(self.var_map, self.var_count)
            normalized_tree = normalizer.visit(tree)
            
            # Update the var_count for future normalizations
            self.var_count = normalizer.var_count
            
            # Convert back to source code
            return astor.to_source(normalized_tree)
        except Exception as e:
            print(f"Error normalizing code: {e}")
            return code
    
    def compare_code(self, normalized_ai_code, normalized_candidate_code):
        """
        Compare the normalized AI code with the normalized candidate code.
        """
        # Simple string similarity for now
        # In a production environment, you would use more sophisticated comparison
        if normalized_ai_code == normalized_candidate_code:
            return True, 1.0, "Exact match with AI-generated code", ["Exact match"]
        
        # Check for high similarity (e.g., 90% of lines match)
        ai_lines = set(normalized_ai_code.splitlines())
        candidate_lines = set(normalized_candidate_code.splitlines())
        
        common_lines = ai_lines.intersection(candidate_lines)
        similarity = len(common_lines) / max(len(ai_lines), len(candidate_lines))
        
        if similarity > 0.9:
            return True, similarity, f"High similarity ({similarity:.2f}) with AI-generated code", ["High similarity"]
        
        return False, similarity, f"Low similarity ({similarity:.2f}) with AI-generated code", []
    
    def check_code(self, problem_statement, candidate_code, language):
        """
        Check if the candidate code matches AI-generated code.
        """
        # Generate AI code
        ai_generated_code = self.generate_ai_code(problem_statement, language)
        print("--------------------------------")
        print(ai_generated_code)
        print("--------------------------------")
        # If we couldn't generate AI code, return a safe default
        if ai_generated_code is None:
            return {
                "is_cheating": False,
                "confidence": 0.0,
                "explanation": "Could not generate AI code for comparison",
                "suspicious_patterns": []
            }
        # Normalize both codes
        try:
            normalized_ai_code = self.normalize_code(ai_generated_code)
            normalized_candidate_code = self.normalize_code(candidate_code)
            
            # Compare the normalized codes
            is_cheating, confidence, explanation, suspicious_matches = self.compare_code(normalized_ai_code, normalized_candidate_code)
            
            # Return the result
            return {
                "is_cheating": is_cheating,
                "confidence": confidence,
                "explanation": explanation,
                "suspicious_patterns": suspicious_matches
            }
        except Exception as e:
            print(f"Error during code comparison: {e}")
            return {
                "is_cheating": False,
                "confidence": 0.0,
                "explanation": f"Error during code comparison: {str(e)}",
                "suspicious_patterns": []
            } 