from app.ai.provider_base import AIProvider
from app.ai.gemini_provider import GeminiProvider
from app.core.config import settings

_provider_instance: AIProvider = None

def get_ai_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is None:
        # Default to GeminiProvider (which handles fallback gracefully if unconfigured)
        _provider_instance = GeminiProvider()
    return _provider_instance

def analyze_user_journal(content: str):
    provider = get_ai_provider()
    return provider.analyze_journal(content)

def explain_user_evidence(evidence_data: dict) -> str:
    provider = get_ai_provider()
    return provider.explain_evidence(evidence_data)
