#!/usr/bin/env python3
"""
Script to set up the Hugging Face token for the cheat detection service.
"""
import os
import sys
import getpass

def main():
    print("Hugging Face Token Setup")
    print("========================")
    print("This script will help you set up your Hugging Face token for the cheat detection service.")
    print("You need a Hugging Face account and an access token to use the Inference API.")
    print("\nTo get a token:")
    print("1. Go to https://huggingface.co/settings/tokens")
    print("2. Create a new token with 'read' access")
    print("3. Copy the token and paste it below\n")
    print("Note: This token will be used to authenticate API requests to Hugging Face.")
    print("      The model will not be downloaded to your machine.\n")
    
    token = getpass.getpass("Enter your Hugging Face token: ")
    
    if not token:
        print("Error: Token cannot be empty.")
        sys.exit(1)
    
    # Create or update .env file
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    
    with open(env_file, "w") as f:
        f.write(f"HF_TOKEN={token}\n")
    
    print(f"\nToken saved to {env_file}")
    print("You can now run the cheat detection service with your token.")
    print("\nTo use the token in your current session, run:")
    if sys.platform == "win32":
        print(f"set HF_TOKEN={token}")
    else:
        print(f"export HF_TOKEN={token}")

if __name__ == "__main__":
    main() 