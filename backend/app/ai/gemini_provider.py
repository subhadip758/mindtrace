import json
import httpx
from typing import Dict, Any, List
from app.ai.provider_base import AIProviderBase
from app.core.config import settings

class GeminiProvider(AIProviderBase):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY

    def analyze_journal(self, content: str, mood_tags: List[str], activity_tags: List[str]) -> Dict[str, Any]:
        if not self.api_key:
            return self._fallback_analysis(content, mood_tags, activity_tags)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        prompt = f"""You are a professional psychological intelligence AI. Analyze the following reflection entry:
Content: "{content}"
Mood Tags: {mood_tags}
Activity Tags: {activity_tags}

Extract psychological signals and return ONLY a valid JSON object matching this schema EXACTLY:
{{
  "summary": "1-2 sentence psychometric reflection summary",
  "emotional_signals": ["signal1", "signal2"],
  "behavioral_signals": ["signal1", "signal2"],
  "themes": ["theme1", "theme2"],
  "cognitive_biases": ["Catastrophizing", "Dichotomous Thinking"],
  "cognitive_load_index": 6.5,
  "confidence_score": 0.88
}}"""

        try:
            response = httpx.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=12.0
            )
            if response.status_code == 200:
                res_data = response.json()
                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = text_out.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:-3].strip()
                elif clean_json.startswith("```"):
                    clean_json = clean_json[3:-3].strip()
                return json.loads(clean_json)
        except Exception as e:
            print(f"Gemini REST Provider Error: {e}")

        return self._fallback_analysis(content, mood_tags, activity_tags)

    def explain_evidence(self, metric_a: str, metric_b: str, rho: float, p_val: float, sample_size: int) -> str:
        if not self.api_key:
            return f"Observational co-variation of ρ = {rho} detected between {metric_a} and {metric_b} across {sample_size} paired daily records."

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        prompt = f"Explain this statistical association in 2 clear sentences without claiming direct causality: {metric_a} vs {metric_b}, Spearman correlation rho = {rho}, p-value = {p_val}, sample size N = {sample_size}."
        
        try:
            response = httpx.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=10.0
            )
            if response.status_code == 200:
                res_data = response.json()
                return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"Gemini Explain Error: {e}")

        return f"Observational co-variation of ρ = {rho} detected between {metric_a} and {metric_b} across {sample_size} paired daily records."

    def generate_weekly_report(self, user_summary_data: Dict[str, Any]) -> str:
        return "Weekly Behavioral Intelligence Synthesis: Active data collection ongoing. Correlations update dynamically as N increases."

    def _fallback_analysis(self, content: str, mood_tags: List[str], activity_tags: List[str]) -> Dict[str, Any]:
        content_lower = content.lower()
        
        biases = []
        if any(w in content_lower for w in ["always", "never", "ruined", "impossible", "horrible"]):
            biases.append("Catastrophizing")
        if any(w in content_lower for w in ["completely", "totally", "perfect", "failure"]):
            biases.append("Dichotomous Thinking")

        cog_load = 5.0
        if len(content.split()) > 40:
            cog_load += 1.5
        if len(biases) > 0:
            cog_load += 1.5
            
        return {
            "summary": "Reflection captured and logged into personal psychometric history.",
            "emotional_signals": mood_tags if mood_tags else ["Reflective"],
            "behavioral_signals": activity_tags if activity_tags else ["Self-Observation"],
            "themes": ["Daily Routine", "Mental State"],
            "cognitive_biases": biases,
            "cognitive_load_index": min(10.0, round(cog_load, 1)),
            "confidence_score": 0.90
        }
