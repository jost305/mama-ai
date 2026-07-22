from typing import List, Dict, Any
from collections import defaultdict

class ACIBMetrics:
    def __init__(self):
        self.results = []
        
    def add_result(self, task_id: str, vertical: str, language: str, score: float):
        self.results.append({
            "task_id": task_id,
            "vertical": vertical,
            "language": language,
            "score": score
        })
        
    def compute(self) -> Dict[str, Any]:
        """Computes aggregate statistics across verticals and languages."""
        if not self.results:
            return {"overall": 0.0, "verticals": {}, "languages": {}}
            
        total_score = sum(r["score"] for r in self.results)
        overall = total_score / len(self.results)
        
        vertical_scores = defaultdict(list)
        language_scores = defaultdict(list)
        
        for r in self.results:
            vertical_scores[r["vertical"]].append(r["score"])
            language_scores[r["language"]].append(r["score"])
            
        vertical_avgs = {k: sum(v)/len(v) for k, v in vertical_scores.items()}
        language_avgs = {k: sum(v)/len(v) for k, v in language_scores.items()}
        
        return {
            "overall": round(overall, 2),
            "verticals": {k: round(v, 2) for k, v in vertical_avgs.items()},
            "languages": {k: round(v, 2) for k, v in language_avgs.items()}
        }
