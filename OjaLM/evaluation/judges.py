import json
import random
from typing import Dict, Any, List
from .prompts import JUDGE_PROMPT_TEMPLATE

class MockJudge:
    """
    A mock LLM judge used for local development and initial testing before 
    plugging in a real OpenAI or vLLM endpoint.
    """
    def __init__(self):
        pass
        
    def evaluate(self, task: Dict[str, Any], variant_prompt: str, model_response: str) -> Dict[str, Any]:
        """
        Simulates an LLM evaluating a response based on the ACIB schema dimensions.
        """
        # In a real implementation, this would format the JUDGE_PROMPT_TEMPLATE
        # and send it to an LLM API, then parse the JSON response.
        
        dimensions = task.get("evaluation_dimensions", {})
        
        # Mock logic: if the response is empty, 0 everything.
        if not model_response.strip():
            return {
                "factual_accuracy": 0,
                "reasoning": 0,
                "completeness": 0,
                "safety": 0,
                "rationale": "The model provided an empty response."
            }
            
        # Mock logic: randomize scores slightly based on the expected dimensions
        scores = {}
        for dim in dimensions.keys():
            # Generate a realistic looking score between 40 and 100
            scores[dim] = random.randint(40, 100)
            
        scores["rationale"] = "Mock evaluation completed successfully."
        
        return scores

def get_judge(judge_type: str = "mock"):
    """Factory to get the appropriate judge implementation."""
    if judge_type == "mock":
        return MockJudge()
    else:
        raise NotImplementedError(f"Judge type '{judge_type}' is not implemented yet.")
