import os
from typing import Dict, Any
from .utils import save_json, ensure_dir

class ReportGenerator:
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir
        ensure_dir(self.output_dir)
        
    def generate(self, model_name: str, version: str, metrics: Dict[str, Any]) -> str:
        """Generates a beautiful markdown report for a specific model evaluation."""
        report_path = os.path.join(self.output_dir, f"{model_name}_v{version}.md")
        
        overall = metrics.get("overall", 0.0)
        verticals = metrics.get("verticals", {})
        languages = metrics.get("languages", {})
        
        # Determine readiness
        ready = "READY" if overall >= 85.0 else "NOT READY FOR OjaLM-1"
        
        md = f"""====================================
ACIB v{version} Evaluation Report
====================================

Model:
{model_name}

Overall
{overall}%

------------------------------------
"""
        # Verticals
        for v_name, v_score in verticals.items():
            md += f"\n{v_name}\n{v_score}%\n"
            
        md += "\n------------------------------------\n\nLanguages\n\n"
        
        # Languages
        for l_name, l_score in languages.items():
            # Pad language name to 20 chars with dots
            padded_name = f"{l_name}.".ljust(22, '.')
            md += f"{padded_name}{l_score}%\n\n"
            
        md += "------------------------------------\n\nRecommendation\n\n"
        
        # Pass/Fail analysis (Threshold 85%)
        for v_name, v_score in verticals.items():
            if v_score >= 85.0:
                md += f"PASS:\n{v_name}\n\n"
            else:
                md += f"FAIL:\n{v_name}\n\n"
                
        md += f"Overall\n\n{ready}\n"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(md)
            
        return report_path
