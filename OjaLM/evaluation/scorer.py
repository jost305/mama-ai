from typing import Dict, Any, Tuple
from .judges import get_judge

class ACIBScorer:
    def __init__(self, judge_type: str = "mock"):
        self.judge = get_judge(judge_type)
        
    def score_response(self, task: Dict[str, Any], variant_prompt: str, response: str) -> Dict[str, Any]:
        """
        Scores a single model response based on the ACIB dimensions.
        Returns a dictionary of dimension scores and the weighted final score.
        """
        # 1. Get raw scores from the judge
        raw_scores = self.judge.evaluate(task, variant_prompt, response)
        
        # 2. Extract weights from the task definition
        dimensions = task.get("evaluation_dimensions", {})
        
        weighted_score = 0.0
        total_weight = 0
        
        for dim, weight in dimensions.items():
            if dim in raw_scores:
                weighted_score += (raw_scores[dim] * weight)
                total_weight += weight
                
        # Normalize to a percentage (0-100)
        final_score = (weighted_score / total_weight) if total_weight > 0 else 0.0
        
        return {
            "final_score": round(final_score, 2),
            "dimensions": raw_scores,
            "rationale": raw_scores.get("rationale", "")
        }
