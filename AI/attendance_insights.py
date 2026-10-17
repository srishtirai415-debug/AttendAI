"""Explainable attendance calculations and recommendations for AttendAI."""

import json
import math
import sys
from typing import Any

DEFAULT_TARGET = 75


def _whole_number(value: Any, field_name: str, minimum: int = 0) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise ValueError(f"{field_name} must be an integer greater than or equal to {minimum}.")
    return value


def _attendance_counts(subject: dict[str, Any]) -> tuple[int, int]:
    if not isinstance(subject, dict):
        raise ValueError("Each subject must be an object.")

    held = _whole_number(subject.get("classes_held"), "classes_held")
    attended = _whole_number(subject.get("classes_attended"), "classes_attended")
    if attended > held:
        raise ValueError("classes_attended cannot exceed classes_held.")
    return held, attended


def _target_percentage(value: Any) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 < value <= 100:
        raise ValueError("target_percentage must be greater than 0 and at most 100.")
    return float(value)


def _percentage(held: int, attended: int) -> float | None:
    if held == 0:
        return None
    return round(attended / held * 100, 2)


def _classes_needed(held: int, attended: int, target_percentage: float) -> int | None:
    if held == 0:
        return 1
    if attended / held * 100 >= target_percentage:
        return 0
    if target_percentage == 100:
        return None

    target = target_percentage / 100
    return math.ceil((target * held - attended) / (1 - target))


def calculate_recovery(payload: dict[str, Any]) -> dict[str, Any]:
    """Return the current attendance and consecutive attended classes needed."""
    held, attended = _attendance_counts(payload)
    target = _target_percentage(payload.get("target_percentage", DEFAULT_TARGET))
    current = _percentage(held, attended)
    needed = _classes_needed(held, attended, target)

    if needed is None:
        message = "A finite number of attended classes cannot reach exactly 100% from the current record."
    elif needed == 0:
        message = "The attendance target has already been met."
    else:
        message = f"Attend the next {needed} consecutive class{'es' if needed != 1 else ''} to reach the target."

    return {
        "current_percentage": current,
        "target_percentage": target,
        "classes_needed": needed,
        "message": message,
    }


def generate_insights(payload: dict[str, Any]) -> dict[str, Any]:
    """Return deterministic, prioritized advice for the supplied subjects."""
    subjects = payload.get("subjects")
    if not isinstance(subjects, list):
        raise ValueError("subjects must be an array.")

    target = _target_percentage(payload.get("attendance_threshold", DEFAULT_TARGET))
    insights = []

    for subject in subjects:
        held, attended = _attendance_counts(subject)
        name = subject.get("name")
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Each subject must have a non-empty name.")

        subject_id = subject.get("id")
        if subject_id is not None:
            subject_id = _whole_number(subject_id, "id", minimum=1)

        current = _percentage(held, attended)
        if held == 0:
            insights.append(
                {
                    "subject_id": subject_id,
                    "subject_name": name.strip(),
                    "attendance_percentage": None,
                    "attendance_status": "not_started",
                    "priority": "low",
                    "classes_needed": 1,
                    "message": "No classes have been held yet. Attend the first class to start tracking attendance.",
                }
            )
            continue

        if current is not None and current < target:
            needed = _classes_needed(held, attended, target)
            priority = "high" if current < target / 2 else "medium"
            if needed is None:
                advice = "A finite number of classes cannot reach exactly 100%; every future class would need to be attended."
            else:
                advice = f"Attend the next {needed} consecutive class{'es' if needed != 1 else ''} to reach the target."
            insights.append(
                {
                    "subject_id": subject_id,
                    "subject_name": name.strip(),
                    "attendance_percentage": current,
                    "attendance_status": "low",
                    "priority": priority,
                    "classes_needed": needed,
                    "message": (
                        f"Attendance is {current}%, below the {target:g}% target. {advice}"
                    ),
                }
            )
        else:
            insights.append(
                {
                    "subject_id": subject_id,
                    "subject_name": name.strip(),
                    "attendance_percentage": current,
                    "attendance_status": "on_track",
                    "priority": "low",
                    "classes_needed": 0,
                    "message": f"Attendance meets the {target:g}% target. Keep attending classes regularly.",
                }
            )

    insights.sort(
        key=lambda item: (
            {"high": 0, "medium": 1, "low": 2}[item["priority"]],
            item["attendance_percentage"] if item["attendance_percentage"] is not None else -1,
            item["subject_name"].casefold(),
        )
    )
    return {"attendance_threshold": target, "insights": insights}


def calculate_what_if(payload: dict[str, Any]) -> dict[str, Any]:
    """Show projected attendance after attending or missing future classes."""
    held, attended = _attendance_counts(payload)
    attend_next = _whole_number(payload.get("classes_to_attend", 0), "classes_to_attend")
    miss_next = _whole_number(payload.get("classes_to_miss", 0), "classes_to_miss")
    projected_held = held + attend_next + miss_next
    projected_attended = attended + attend_next

    return {
        "current_percentage": _percentage(held, attended),
        "projected_percentage": _percentage(projected_held, projected_attended),
        "classes_held": projected_held,
        "classes_attended": projected_attended,
        "message": (
            "The projection assumes the specified future classes are attended or missed "
            "exactly as entered; it does not change the saved record."
        ),
    }


def run_action(payload: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("The request body must be a JSON object.")

    action = payload.get("action")
    if action == "insights":
        return generate_insights(payload)
    if action == "calculator":
        return calculate_recovery(payload)
    if action == "what_if":
        return calculate_what_if(payload)
    raise ValueError("action must be one of: insights, calculator, what_if.")


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        result = run_action(payload)
    except json.JSONDecodeError:
        print(json.dumps({"error": {"code": "VALIDATION_ERROR", "message": "Request must contain valid JSON."}}))
        return 2
    except ValueError as error:
        print(json.dumps({"error": {"code": "VALIDATION_ERROR", "message": str(error)}}))
        return 2

    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
