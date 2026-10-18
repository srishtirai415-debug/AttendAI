import unittest

from attendance_insights import calculate_recovery, calculate_what_if, generate_insights, run_action


class RecoveryCalculatorTests(unittest.TestCase):
    def test_calculates_classes_needed(self):
        result = calculate_recovery(
            {"classes_held": 30, "classes_attended": 21, "target_percentage": 75}
        )
        self.assertEqual(result["current_percentage"], 70)
        self.assertEqual(result["classes_needed"], 6)

    def test_returns_zero_when_target_is_met(self):
        result = calculate_recovery(
            {"classes_held": 40, "classes_attended": 32, "target_percentage": 75}
        )
        self.assertEqual(result["classes_needed"], 0)

    def test_handles_no_classes_held(self):
        result = calculate_recovery(
            {"classes_held": 0, "classes_attended": 0, "target_percentage": 75}
        )
        self.assertIsNone(result["current_percentage"])
        self.assertEqual(result["classes_needed"], 1)

    def test_100_percent_target_when_some_classes_were_missed(self):
        result = calculate_recovery(
            {"classes_held": 10, "classes_attended": 9, "target_percentage": 100}
        )
        self.assertIsNone(result["classes_needed"])

    def test_rejects_invalid_counts(self):
        with self.assertRaises(ValueError):
            calculate_recovery(
                {"classes_held": 10, "classes_attended": 11, "target_percentage": 75}
            )

    def test_rejects_boolean_counts(self):
        with self.assertRaises(ValueError):
            calculate_recovery(
                {"classes_held": True, "classes_attended": 0, "target_percentage": 75}
            )


class InsightsTests(unittest.TestCase):
    def test_prioritizes_low_attendance_and_handles_unstarted_subject(self):
        result = generate_insights(
            {
                "attendance_threshold": 75,
                "subjects": [
                    {"id": 1, "name": "Safe", "classes_held": 10, "classes_attended": 8},
                    {"id": 2, "name": "Low", "classes_held": 10, "classes_attended": 3},
                    {"id": 3, "name": "New", "classes_held": 0, "classes_attended": 0},
                ],
            }
        )
        insights = result["insights"]
        self.assertEqual(insights[0]["subject_name"], "Low")
        self.assertEqual(insights[0]["priority"], "high")
        self.assertEqual(insights[1]["subject_name"], "New")
        self.assertIsNone(insights[1]["attendance_percentage"])
        self.assertEqual(insights[2]["attendance_status"], "on_track")

    def test_calculates_recovery_from_60_percent_to_75_percent(self):
        result = calculate_recovery(
            {"classes_held": 30, "classes_attended": 18, "target_percentage": 75}
        )
        self.assertEqual(result["classes_needed"], 18)

    def test_rejects_empty_subject_name(self):
        with self.assertRaises(ValueError):
            generate_insights(
                {
                    "subjects": [
                        {"id": 1, "name": " ", "classes_held": 2, "classes_attended": 2}
                    ]
                }
            )

    def test_rejects_invalid_threshold(self):
        with self.assertRaises(ValueError):
            generate_insights({"attendance_threshold": 0, "subjects": []})


class WhatIfTests(unittest.TestCase):
    def test_projects_attended_and_missed_classes(self):
        result = calculate_what_if(
            {
                "classes_held": 10,
                "classes_attended": 7,
                "classes_to_attend": 2,
                "classes_to_miss": 1,
            }
        )
        self.assertEqual(result["classes_held"], 13)
        self.assertEqual(result["classes_attended"], 9)
        self.assertEqual(result["projected_percentage"], 69.23)

    def test_dispatches_supported_action(self):
        self.assertEqual(
            run_action(
                {
                    "action": "calculator",
                    "classes_held": 30,
                    "classes_attended": 21,
                    "target_percentage": 75,
                }
            )["classes_needed"],
            6,
        )


if __name__ == "__main__":
    unittest.main()
