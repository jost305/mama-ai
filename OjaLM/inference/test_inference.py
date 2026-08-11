"""
Diagnostic & Testing Utility for OjaLM Modal Inference Service
===============================================================
Usage:
  python test_inference.py --url https://<your-modal-app-url>.modal.run --key <OJALM_API_KEY>
"""

import sys
import argparse
import requests
import json

def test_inference(base_url, api_key=None):
    base_url = base_url.rstrip("/")
    print("==================================================")
    print(f" 🧪 OJALM MODAL INFERENCE TEST SUITE")
    print(f"    Target URL: {base_url}")
    print("==================================================")

    # 1. Health Check
    health_url = f"{base_url}/health"
    print(f"\n1. Testing GET {health_url}...")
    try:
        r = requests.get(health_url, timeout=10)
        print(f"   Status Code: {r.status_code}")
        print(f"   Response: {r.text}")
        if r.status_code == 200:
            print("   ✓ Health check PASSED!")
        else:
            print("   ❌ Health check FAILED!")
    except Exception as e:
        print(f"   ❌ Health check ERROR: {e}")

    # 2. Chat Completions Test
    chat_url = f"{base_url}/v1/chat/completions"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "model": "OjaLM-v0.1",
        "messages": [
            {"role": "system", "content": "You are OjaLM, an AI foundation model for African market commerce."},
            {"role": "user", "content": "Hello, who are you and how can you help me?"}
        ],
        "temperature": 0.3,
        "max_tokens": 256
    }

    print(f"\n2. Testing POST {chat_url}...")
    print(f"   Prompt: '{payload['messages'][1]['content']}'")
    try:
        r = requests.post(chat_url, headers=headers, json=payload, timeout=60)
        print(f"   Status Code: {r.status_code}")
        if r.status_code == 200:
            res_data = r.json()
            answer = res_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print("   ✓ Chat completion PASSED!")
            print("\n   --- OJALM RESPONSE ---")
            print(answer)
            print("   ----------------------")
            print(f"   Latency: {res_data.get('latency_ms', 'N/A')} ms | Provider: {res_data.get('provider', 'modal')}")
        else:
            print(f"   ❌ Chat completion FAILED ({r.status_code}): {r.text}")
    except Exception as e:
        print(f"   ❌ Chat completion ERROR: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test OjaLM Modal Endpoint")
    parser.add_argument("--url", required=True, help="Base URL of Modal endpoint (e.g., https://username--ojalm-inference-serve.modal.run)")
    parser.add_argument("--key", default="", help="OJALM_API_KEY (optional)")
    args = parser.parse_args()

    test_inference(args.url, args.key)
