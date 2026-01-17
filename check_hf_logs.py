#!/usr/bin/env python3
"""
Hugging Face Space Logs Viewer
Access and stream logs from your HF Space deployment
"""

import os
import sys
import requests
from typing import Optional
import json

class HFLogsViewer:
    def __init__(self, hf_token: Optional[str] = None, space_name: str = "AbdulMateen5251/hacton"):
        self.hf_token = hf_token or os.getenv("HF_TOKEN")
        self.space_name = space_name
        self.base_url = f"https://huggingface.co/api/spaces/{space_name}"
        
        if not self.hf_token:
            print("❌ Error: HF_TOKEN not found!")
            print("Set it with: export HF_TOKEN='your_token_here'")
            sys.exit(1)
    
    def get_headers(self) -> dict:
        """Return headers with authorization"""
        return {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json"
        }
    
    def get_container_logs(self):
        """Get running container logs (SSE)"""
        print(f"\n📦 Fetching container logs from {self.space_name}...")
        print("─" * 60)
        
        url = f"{self.base_url}/logs/run"
        headers = self.get_headers()
        
        try:
            response = requests.get(url, headers=headers, stream=True)
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line_decoded = line.decode('utf-8')
                    # Handle SSE format
                    if line_decoded.startswith('data:'):
                        print(line_decoded[5:].strip())
                    else:
                        print(line_decoded)
        
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP Error: {e.response.status_code}")
            print(f"Response: {e.response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def get_build_logs(self):
        """Get build logs (SSE)"""
        print(f"\n🔨 Fetching build logs from {self.space_name}...")
        print("─" * 60)
        
        url = f"{self.base_url}/logs/build"
        headers = self.get_headers()
        
        try:
            response = requests.get(url, headers=headers, stream=True)
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line_decoded = line.decode('utf-8')
                    # Handle SSE format
                    if line_decoded.startswith('data:'):
                        print(line_decoded[5:].strip())
                    else:
                        print(line_decoded)
        
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP Error: {e.response.status_code}")
            print(f"Response: {e.response.text}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    def get_space_status(self):
        """Get Space status and info"""
        print(f"\n📋 Checking Space status for {self.space_name}...")
        print("─" * 60)
        
        url = self.base_url
        headers = self.get_headers()
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            print(f"Space ID: {data.get('id', 'N/A')}")
            print(f"Status: {data.get('runtime', {}).get('stage', 'N/A')}")
            print(f"SDK: {data.get('sdk', 'N/A')}")
            print(f"Private: {data.get('private', False)}")
            
            if 'runtime' in data:
                runtime = data['runtime']
                print(f"\n🔧 Runtime Info:")
                print(f"  Stage: {runtime.get('stage', 'N/A')}")
                print(f"  Hardware: {runtime.get('hardware', {}).get('name', 'N/A')}")
                
        except Exception as e:
            print(f"❌ Error: {e}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Hugging Face Space Logs Viewer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Get container logs
  python check_hf_logs.py --container
  
  # Get build logs
  python check_hf_logs.py --build
  
  # Get space status
  python check_hf_logs.py --status
  
  # Get all logs
  python check_hf_logs.py --all
        """
    )
    
    parser.add_argument(
        "--container",
        action="store_true",
        help="Get running container logs"
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Get build logs"
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Get space status"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Get all logs and status"
    )
    parser.add_argument(
        "--token",
        type=str,
        help="Hugging Face API token (or set HF_TOKEN env var)"
    )
    parser.add_argument(
        "--space",
        type=str,
        default="AbdulMateen5251/hacton",
        help="Space name (default: AbdulMateen5251/hacton)"
    )
    
    args = parser.parse_args()
    
    # If no arguments, show all by default
    if not any([args.container, args.build, args.status, args.all]):
        args.all = True
    
    viewer = HFLogsViewer(hf_token=args.token, space_name=args.space)
    
    print("🚀 Hugging Face Space Logs Viewer")
    print(f"Space: {args.space}")
    print("=" * 60)
    
    if args.container or args.all:
        viewer.get_container_logs()
    
    if args.build or args.all:
        viewer.get_build_logs()
    
    if args.status or args.all:
        viewer.get_space_status()
    
    print("\n" + "=" * 60)
    print("✅ Done!")


if __name__ == "__main__":
    main()
