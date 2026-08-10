from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AIProvider(ABC):
    @abstractmethod
    def analyze_journal(self, text: str) -> Dict[str, Any]:
        """Analyzes journal text and returns structured emotional, cognitive, and behavioral themes."""
        pass

    @abstractmethod
    def explain_evidence(self, evidence_data: Dict[str, Any]) -> str:
        """Explains a statistical evidence object in natural language."""
        pass
