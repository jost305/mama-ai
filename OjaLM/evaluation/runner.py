import time
from typing import Dict, Any
from .utils import load_jsonl
from .scorer import ACIBScorer
from .metrics import ACIBMetrics
from .report_generator import ReportGenerator
from .leaderboard import Leaderboard

class ACIBRunner:
    def __init__(self, benchmark_path: str, model_name: str, version: str = "0.1"):
        self.benchmark_path = benchmark_path
        self.model_name = model_name
        self.version = version
        
        self.scorer = ACIBScorer()
        self.metrics = ACIBMetrics()
        self.reporter = ReportGenerator()
        self.leaderboard = Leaderboard()
        
    def _query_model(self, prompt: str) -> str:
        """
        Simulates querying the target foundation model.
        In a real implementation, this would use transformers/vLLM/OpenAI.
        """
        return f"This is a simulated response from {self.model_name} to the prompt: {prompt}"

    def run(self):
        print(f"Loading benchmark {self.benchmark_path}...")
        tasks = load_jsonl(self.benchmark_path)
        
        print(f"Found {len(tasks)} tasks. Starting evaluation for {self.model_name}...")
        
        for idx, task in enumerate(tasks):
            task_id = task.get("id", f"unknown-{idx}")
            vertical = task.get("vertical", "Unknown")
            variants = task.get("variants", {})
            
            for lang, variant_data in variants.items():
                prompt = variant_data.get("prompt", "")
                
                # 1. Query Model
                response = self._query_model(prompt)
                
                # 2. Score Response
                score_data = self.scorer.score_response(task, prompt, response)
                final_score = score_data["final_score"]
                
                # 3. Add to Metrics
                self.metrics.add_result(task_id, vertical, lang, final_score)
                
                print(f"[{task_id}] [{lang}] Score: {final_score}%")
                
        # Compute final metrics
        final_metrics = self.metrics.compute()
        
        # Generate Report
        report_path = self.reporter.generate(self.model_name, self.version, final_metrics)
        print(f"\nReport generated: {report_path}")
        
        # Update Leaderboard
        self.leaderboard.update(self.model_name, final_metrics["overall"])
        print("Leaderboard updated.")
