#!/usr/bin/env python3
"""
Simple script to test the cheat detection service.
"""
import requests
import json

def test_health_check():
    """Test the health check endpoint."""
    response = requests.get('http://localhost:5001/health')
    print(f"Health check response: {response.status_code}")
    print(f"Response body: {response.json()}")
    return response.status_code == 200

def test_check_code_clean():
    """Test the check-code endpoint with clean code."""
    url = 'http://localhost:5001/check-code'
    data = {
        'problem_statement': 'Given an array of integers, find the maximum sum of any contiguous subarray.',
        'candidate_code': 'def solve(nums):\n    max_sum = float("-inf")\n    current_sum = 0\n    for num in nums:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum',
        'language': 'python'
    }
    
    response = requests.post(url, json=data)
    print(f"Check code (clean) response: {response.status_code}")
    print(f"Response body: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_check_code_suspicious():
    """Test the check-code endpoint with suspicious code."""
    url = 'http://localhost:5001/check-code'
    data = {
        'problem_statement': 'Given an array of integers, find the maximum sum of any contiguous subarray.',
        'candidate_code': 'def solve(nums):\n    # Found on stackoverflow.com/questions/12345\n    # Copied from github.com/user/repo\n    max_sum = float("-inf")\n    current_sum = 0\n    for num in nums:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum',
        'language': 'python'
    }
    
    response = requests.post(url, json=data)
    print(f"Check code (suspicious) response: {response.status_code}")
    print(f"Response body: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

if __name__ == '__main__':
    print("Testing cheat detection service...")
    
    # Test health check
    print("\nTesting health check endpoint...")
    health_check_passed = test_health_check()
    print(f"Health check test {'passed' if health_check_passed else 'failed'}")
    
    # Test check code with clean code
    print("\nTesting check-code endpoint with clean code...")
    check_code_clean_passed = test_check_code_clean()
    print(f"Check code (clean) test {'passed' if check_code_clean_passed else 'failed'}")
    
    # Test check code with suspicious code
    print("\nTesting check-code endpoint with suspicious code...")
    check_code_suspicious_passed = test_check_code_suspicious()
    print(f"Check code (suspicious) test {'passed' if check_code_suspicious_passed else 'failed'}")
    
    # Overall result
    print("\nOverall test result:", "PASSED" if health_check_passed and check_code_clean_passed and check_code_suspicious_passed else "FAILED") 