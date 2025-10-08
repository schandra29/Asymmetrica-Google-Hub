"""
Unit Tests for VSQL (Validated Synthesis Query Language) Engine
==============================================================

This test suite validates the functionality of the VSQL_Engine, ensuring
that task classification, document retrieval, and confidence scoring
work as expected.
"""

import unittest
from engines.experimental.vsql_engine import VSQL_Engine

class TestVSQLEngine(unittest.TestCase):
    """
    Test cases for the VSQL_Engine class.
    """

    def setUp(self):
        """
        Set up a new VSQL_Engine instance for each test.
        """
        self.engine = VSQL_Engine()

    def test_classify_task_discovery(self):
        """
        Test that a task is correctly classified as DISCOVERY.
        """
        description = "We need to explore new ways to visualize data."
        result = self.engine.classify_task(description)
        self.assertEqual(result["classified_phase"], "DISCOVERY")
        self.assertGreater(result["scores"]["DISCOVERY"], 0)

    def test_classify_task_validation(self):
        """
        Test that a task is correctly classified as VALIDATION.
        """
        description = "Please fix bug #123 and add documentation for the new module."
        result = self.engine.classify_task(description)
        self.assertEqual(result["classified_phase"], "VALIDATION")
        self.assertGreater(result["scores"]["VALIDATION"], 0)

    def test_classify_task_integration(self):
        """
        Test that a task is correctly classified as INTEGRATION.
        """
        description = "We need to integrate the new API and deploy it to production."
        result = self.engine.classify_task(description)
        self.assertEqual(result["classified_phase"], "INTEGRATION")
        self.assertGreater(result["scores"]["INTEGRATION"], 0)

    def test_classify_task_needs_clarification(self):
        """
        Test that a task with no keywords is marked for clarification.
        """
        description = "Let's have a meeting about the project."
        result = self.engine.classify_task(description)
        self.assertEqual(result["classified_phase"], "NEEDS_CLARIFICATION")
        self.assertEqual(sum(result["scores"].values()), 0)

    def test_get_relevant_documents_discovery(self):
        """
        Test document retrieval for the DISCOVERY phase.
        """
        documents = self.engine.get_relevant_documents("DISCOVERY")
        self.assertIn("source_materials/prismatica_era/PRISMATH/Mathematical_Consciousness_Framework_Academic.html", documents)

    def test_get_relevant_documents_validation(self):
        """
        Test document retrieval for the VALIDATION phase.
        """
        documents = self.engine.get_relevant_documents("VALIDATION")
        self.assertIn("source_materials/prismatica_era/DefenseKit/ARCHITECTURE.md", documents)

    def test_get_relevant_documents_integration(self):
        """
        Test document retrieval for the INTEGRATION phase.
        """
        documents = self.engine.get_relevant_documents("INTEGRATION")
        self.assertIn("docs/Asymmetrica_Protocol.md", documents)
        self.assertIn("docs/computational_complexity_standards.md", documents)

    def test_get_relevant_documents_unknown(self):
        """
        Test that an unknown phase returns no documents.
        """
        documents = self.engine.get_relevant_documents("UNKNOWN_PHASE")
        self.assertEqual(len(documents), 0)

    def test_get_confidence_score_discovery(self):
        """
        Test the confidence score for a DISCOVERY task.
        """
        description = "Let's design a new logo."
        score = self.engine.get_confidence_score(description)
        self.assertEqual(score, 0.30)

    def test_get_confidence_score_validation(self):
        """
        Test the confidence score for a VALIDATION task.
        """
        description = "We must test the new changes thoroughly."
        score = self.engine.get_confidence_score(description)
        self.assertEqual(score, 0.50)

    def test_get_confidence_score_integration(self):
        """
        Test the confidence score for an INTEGRATION task.
        """
        description = "Time to architect the new microservice."
        score = self.engine.get_confidence_score(description)
        self.assertEqual(score, 0.20)

    def test_get_confidence_score_unclassified(self):
        """
        Test that an unclassified task returns a confidence score of 0.
        """
        description = "What are we doing today?"
        score = self.engine.get_confidence_score(description)
        self.assertEqual(score, 0.0)

if __name__ == "__main__":
    unittest.main()