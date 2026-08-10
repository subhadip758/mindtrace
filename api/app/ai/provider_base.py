from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIProviderBase(ABC):
    @abstractmethod
    def analyze_journal(self, content: str, mood_tags: List[str], activity_tags: List[str]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def explain_evidence(self, metric_a: str, metric_b: str, rho: float, p_val: float, sample_size: int) -> str:
        pass

    @abstractmethod
    def generate_weekly_report(self, user_summary_data: Dict[str, Any]) -> str:
        pass

AIProvider = AIProviderBase
