#!/usr/bin/env python3
"""
Test script to verify AI model configuration is working correctly.
Run this before starting the backend to ensure everything is set up.
"""

import os
import sys
from pathlib import Path

# Add backend src to path
backend_path = Path(__file__).parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

def test_env_variables():
    """Check if required environment variables are set."""
    print("🔍 Checking environment variables...\n")
    
    mode = os.getenv("OPENAI_GEMINI_MODE", "false")
    use_openai = mode.lower() in ("true", "1", "yes")
    
    print(f"OPENAI_GEMINI_MODE: {mode}")
    print(f"Using: {'OpenAI' if use_openai else 'Gemini'}\n")
    
    if use_openai:
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if not openai_key or openai_key == "your-openai-api-key-here":
            print("❌ ERROR: OPENAI_API_KEY is not set!")
            print("   Get your key from: https://platform.openai.com/api-keys")
            print("   Then add to .env: OPENAI_API_KEY=sk-proj-xxx...")
            return False
        elif openai_key.startswith("AIza"):
            print("❌ ERROR: OPENAI_API_KEY looks like a Gemini key!")
            print("   OpenAI keys start with 'sk-'")
            print("   Get a real OpenAI key from: https://platform.openai.com/api-keys")
            return False
        else:
            print(f"✅ OPENAI_API_KEY is set: {openai_key[:10]}...{openai_key[-4:]}")
    else:
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if not gemini_key:
            print("❌ ERROR: GEMINI_API_KEY is not set!")
            print("   Get your FREE key from: https://aistudio.google.com/app/apikey")
            print("   Then add to .env: GEMINI_API_KEY=AIza...")
            return False
        else:
            print(f"✅ GEMINI_API_KEY is set: {gemini_key[:10]}...{gemini_key[-4:]}")
    
    return True

def test_agent_import():
    """Test if agent module can be imported."""
    print("\n🔍 Testing agent module import...\n")
    
    try:
        from agent import openai_client, DEFAULT_MODEL, USE_OPENAI_MODE
        
        print(f"✅ Agent module imported successfully")
        print(f"   Mode: {'OpenAI' if USE_OPENAI_MODE else 'Gemini'}")
        print(f"   Model: {DEFAULT_MODEL}")
        print(f"   Client configured: {openai_client is not None}")
        
        return True
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Import Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("AI Model Configuration Test")
    print("=" * 60)
    
    # Load .env file if it exists
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        print(f"📄 Loading .env from: {env_file}\n")
        from dotenv import load_dotenv
        load_dotenv(env_file)
    else:
        print("⚠️  No .env file found, using system environment\n")
    
    # Run tests
    env_ok = test_env_variables()
    import_ok = test_agent_import() if env_ok else False
    
    print("\n" + "=" * 60)
    if env_ok and import_ok:
        print("✅ ALL TESTS PASSED - Ready to start backend!")
        print("=" * 60)
        print("\nRun: cd backend && python src/main.py")
        return 0
    else:
        print("❌ TESTS FAILED - Fix errors above before starting")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
