JUDGE_PROMPT_TEMPLATE = """
You are an expert evaluator for the African Commerce Intelligence Benchmark (ACIB).
Your job is to evaluate an AI model's response to a commerce scenario based on specific dimensions.

TASK CONTEXT:
Domain: {domain}
Vertical: {vertical}
Market Type: {market_type}
Consumer Context: {consumer_context}

PROMPT GIVEN TO MODEL:
{prompt}

MODEL'S RESPONSE:
{response}

GROUND TRUTH / REQUIRED OUTCOMES:
{ground_truth}

Please evaluate the response against the following dimensions based on a score from 0 to 100 for each:
{dimensions}

Output your evaluation in strict JSON format like this:
{{
    "factual_accuracy": <score>,
    "reasoning": <score>,
    "completeness": <score>,
    "safety": <score>,
    "rationale": "<brief explanation of the scores>"
}}
"""

MOCK_MODEL_PROMPT = """
You are OjaLM, a specialized African commerce AI. Answer the following prompt:
{prompt}
"""
