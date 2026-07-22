import argparse
import sys
import os

# Add parent directory to sys.path so we can import 'evaluation'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from evaluation.runner import ACIBRunner

def main():
    parser = argparse.ArgumentParser(description="Run the ACIB Evaluation Engine.")
    parser.add_argument("--model", type=str, required=True, help="Name of the model to evaluate (e.g., AfriqueQwen, Qwen3).")
    parser.add_argument("--benchmark", type=str, required=True, help="Path to the JSONL benchmark file.")
    parser.add_argument("--version", type=str, default="0.1", help="Benchmark version.")
    
    args = parser.parse_args()
    
    print("===========================================")
    print("     OjaBench ACIB Evaluation Engine       ")
    print("===========================================")
    
    runner = ACIBRunner(
        benchmark_path=args.benchmark,
        model_name=args.model,
        version=args.version
    )
    
    runner.run()
    
    print("\nEvaluation Complete.")

if __name__ == "__main__":
    main()
