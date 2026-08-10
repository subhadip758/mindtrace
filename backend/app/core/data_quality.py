from typing import Dict, Any, List, Tuple
from app.models.models import DailyLog, DataProvenance

# Standard validation boundaries based on scientific ranges
VALIDATION_RANGES = {
    "mood": (1.0, 10.0),
    "energy": (1.0, 10.0),
    "focus": (1.0, 10.0),
    "productivity": (1.0, 10.0),
    "sleep_duration": (0.0, 24.0),
    "sleep_quality": (1.0, 10.0),
    "screen_time": (0.0, 24.0),
    "study_work_duration": (0.0, 24.0),
    "exercise_duration": (0.0, 1440.0), # minutes
    "social_duration": (0.0, 1440.0),
}

def validate_and_flag_daily_log(log_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validates user log values against plausible physical ranges.
    Returns cleaned data dictionary and any data quality warnings.
    """
    warnings = []
    cleaned = log_data.copy()

    for metric, (min_val, max_val) in VALIDATION_RANGES.items():
        val = cleaned.get(metric)
        if val is not None:
            if val < min_val or val > max_val:
                warnings.append(f"Metric '{metric}' value {val} outside expected range [{min_val}, {max_val}]. Flagged.")
                # We clamp or keep as flagged, preserving raw user input while keeping range safe
                cleaned[metric] = max(min_val, min(max_val, float(val)))
                
    return cleaned, warnings

def create_provenance_records(daily_log_id: str, log_data: Dict[str, Any], source_type: str = "manual", source_provider: str = None) -> List[DataProvenance]:
    """
    Generates data provenance records for every metric provided in a daily log.
    """
    provenance_list = []
    
    metrics_to_track = [
        "mood", "energy", "focus", "productivity", "sleep_duration",
        "sleep_quality", "screen_time", "study_work_duration",
        "exercise_duration", "social_duration"
    ]
    
    for metric in metrics_to_track:
        val = log_data.get(metric)
        if val is not None:
            prov = DataProvenance(
                daily_log_id=daily_log_id,
                metric_name=metric,
                value=float(val),
                source_type=source_type,
                source_provider=source_provider or "MindTrace App",
                external_record_id=None
            )
            provenance_list.append(prov)
            
    # Handle custom habits
    custom_habits = log_data.get("custom_habits", {})
    if isinstance(custom_habits, dict):
        for habit_name, val in custom_habits.items():
            if val is not None:
                prov = DataProvenance(
                    daily_log_id=daily_log_id,
                    metric_name=f"custom_{habit_name}",
                    value=float(val),
                    source_type=source_type,
                    source_provider=source_provider or "MindTrace App User Custom",
                    external_record_id=None
                )
                provenance_list.append(prov)
                
    return provenance_list
