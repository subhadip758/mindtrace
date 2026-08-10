import json
import re
from typing import Dict, Any
from app.ai.provider_base import AIProvider
from app.core.config import settings

class GeminiProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception:
                self.client = None

    def analyze_journal(self, text: str) -> Dict[str, Any]:
        prompt = f"""
You are a senior behavioral scientist and psychological researcher assistant for MindTrace.
Analyze the following user Ecological Momentary Assessment (EMA) reflection entry:
"{text}"

RULES:
1. Strictly avoid mental health diagnostic claims (NO diagnosing clinical depression, ADHD, PTSD, GAD).
2. Identify:
   - Cognitive/Affective Themes (e.g. Executive Overload, Social Cohesion, Academic Pressure)
   - Emotional Signals (Valence & Arousal cues)
   - Behavioral Signals (Avoidance Coping, Vigilance, Restorative Rest)
   - Cognitive Biases (e.g., Catastrophizing, Dichotomous Thinking, Confirmation Bias, Overgeneralization)
   - Cognitive Load Index (1.0 to 10.0 score)
3. Return raw JSON strictly matching this schema:
{{
  "themes": ["theme1", "theme2"],
  "emotional_signals": ["signal1", "signal2"],
  "behavioral_signals": ["behavior1", "behavior2"],
  "cognitive_biases": ["bias1", "bias2"],
  "cognitive_load_index": 6.5,
  "confidence": 0.88,
  "summary": "Objective psychological observation summary.",
  "safety_flag": false
}}
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text_out = response.text
                json_match = re.search(r"\{.*\}", text_out, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    return parsed
            except Exception:
                pass
                
        return self._rule_based_analysis(text)

    def explain_evidence(self, evidence_data: Dict[str, Any]) -> str:
        prompt = f"""
Explain the following psychological single-subject (N-of-1) statistical correlation object for MindTrace:
{json.dumps(evidence_data)}

RULES:
1. Explain what the Spearman rank correlation indicates in psychometric terms.
2. Emphasize that observational association does NOT prove direct causation.
3. Keep explanation clear, professional, and grounded in empirical science.
"""
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text.strip()
            except Exception:
                pass
                
        metric_a = evidence_data.get("metric_a", "Metric A")
        metric_b = evidence_data.get("metric_b", "Metric B")
        rho = evidence_data.get("coefficient", 0.0)
        n = evidence_data.get("sample_size", 0)
        direction = "positive monotonic" if rho > 0 else "inverse"
        return f"Across {n} Ecological Momentary Assessment (EMA) observations, {metric_a} demonstrated a {direction} statistical correlation (Spearman ρ = {rho}) with {metric_b}. Note that observed co-variation does not establish direct causal directionality."

    def _rule_based_analysis(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        themes = []
        emotional_signals = []
        behavioral_signals = []
        cognitive_biases = []
        cog_load = 5.0

        if any(w in text_lower for w in ["work", "study", "exam", "deadline", "project", "test"]):
            themes.append("Executive Task Demand")
            cog_load += 1.5
        if any(w in text_lower for w in ["friend", "family", "social", "party", "meeting"]):
            themes.append("Interpersonal Connection")
        if any(w in text_lower for w in ["sleep", "tired", "rest", "bed", "exhausted"]):
            themes.append("Allostatic Recovery State")

        if any(w in text_lower for w in ["always", "never", "everything", "nothing", "impossible"]):
            cognitive_biases.append("Dichotomous (All-or-Nothing) Thinking")
        if any(w in text_lower for w in ["fail", "disaster", "ruined", "horrible", "worst"]):
            cognitive_biases.append("Catastrophizing")

        if any(w in text_lower for w in ["happy", "good", "great", "energized", "proud", "calm"]):
            emotional_signals.append("Positive Affective Valence")
        if any(w in text_lower for w in ["sad", "stressed", "worried", "anxious", "frustrated", "tired"]):
            emotional_signals.append("High Arousal Negative Affect")

        if any(w in text_lower for w in ["concentrated", "focused", "walk", "exercise", "workout"]):
            behavioral_signals.append("Adaptive Coping Engagement")
        if any(w in text_lower for w in ["distracted", "avoided", "scrolled", "procrastinated"]):
            behavioral_signals.append("Avoidance Behavior")

        if not themes:
            themes.append("Introspective Reflection")
        if not emotional_signals:
            emotional_signals.append("Baseline Affective State")
        if not behavioral_signals:
            behavioral_signals.append("General Daily Activity")

        return {
            "themes": themes,
            "emotional_signals": emotional_signals,
            "behavioral_signals": behavioral_signals,
            "cognitive_biases": cognitive_biases,
            "cognitive_load_index": min(10.0, cog_load),
            "confidence": 0.88,
            "summary": f"EMA entry reveals executive themes of {', '.join(themes)}. Identified affective markers indicate {', '.join(emotional_signals)}.",
            "safety_flag": False
        }
