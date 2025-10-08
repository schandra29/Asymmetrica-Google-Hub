"""
VSQL (Validated Synthesis Query Language) Engine
=================================================

An engine for classifying R&D tasks and providing data-driven recommendations
based on the Three-Phase Discovery Model synthesized from the Prismatica Era research.

@complexity: O(n) where n is the number of keywords in the task description.
@lineage: (σ: "vsql_engine", ρ: "prismatica_synthesis", γ: "experimental", κ: O(n), λ: ["classify -> retrieve -> score"])
"""

from typing import Dict, List, Tuple, Any

# Canonical distribution ratios from `prismath_universal_engine.py`
# Renamed for clarity from Emergence/Optimization/Support to Discovery/Integration/Validation
THREE_PHASE_DISTRIBUTION = {
    "DISCOVERY": 0.30,
    "INTEGRATION": 0.20,
    "VALIDATION": 0.50,
}

# Keyword mappings for task classification
PHASE_KEYWORDS = {
    "DISCOVERY": ["explore", "discover", "create", "imagine", "brainstorm", "design", "prototype", "new feature"],
    "INTEGRATION": ["integrate", "refactor", "architect", "coordinate", "connect", "deploy", "release"],
    "VALIDATION": ["validate", "test", "fix bug", "document", "maintain", "support", "verify", "consolidate"],
}

class VSQL_Engine:
    """
    Implements the VSQL Engine for task classification and knowledge retrieval.
    """

    def __init__(self):
        """
        Initializes the VSQL Engine.
        """
        self.distribution = THREE_PHASE_DISTRIBUTION
        self.keywords = PHASE_KEYWORDS

    def classify_task(self, task_description: str) -> Dict[str, Any]:
        """
        Classifies a given task description into one of the three phases.

        This function is an adaptation of the `phase_map` function found in
        `prismath_universal_engine.py`.

        @complexity: O(n*m) where n is the number of keywords in the description and m is the number of phase keywords.
        @lineage: (σ: "vsql_engine", ρ: "phase_map", γ: "classification", κ: O(n*m), λ: ["parse -> score -> classify"])

        :param task_description: A natural language string describing the task.
        :return: A dictionary containing the classified phase and the scores for each phase.
        """
        scores = {phase: 0 for phase in self.keywords}
        task_lower = task_description.lower()

        for phase, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in task_lower:
                    scores[phase] += 1

        total_score = sum(scores.values())
        if total_score == 0:
            # Default to a balanced state if no keywords match
            return {"classified_phase": "NEEDS_CLARIFICATION", "scores": scores}

        # Normalize scores
        normalized_scores = {phase: score / total_score for phase, score in scores.items()}

        # Classify based on the highest score
        classified_phase = max(scores, key=scores.get)

        return {"classified_phase": classified_phase, "scores": normalized_scores}

    def get_relevant_documents(self, phase: str) -> List[str]:
        """
        Retrieves a list of relevant documents for a given phase.

        *** This is a placeholder implementation. ***
        A future version will query a knowledge base.

        @complexity: O(1)
        @lineage: (σ: "vsql_engine", ρ: "knowledge_retrieval", γ: "placeholder", κ: O(1), λ: ["query"])

        :param phase: The phase to retrieve documents for (e.g., "DISCOVERY").
        :return: A list of recommended document paths.
        """
        if phase == "DISCOVERY":
            return ["source_materials/prismatica_era/PRISMATH/Mathematical_Consciousness_Framework_Academic.html"]
        elif phase == "VALIDATION":
            return ["source_materials/prismatica_era/DefenseKit/ARCHITECTURE.md"]
        elif phase == "INTEGRATION":
            return ["docs/Asymmetrica_Protocol.md", "docs/computational_complexity_standards.md"]
        else:
            return []

    def get_confidence_score(self, task_description: str) -> float:
        """
        Calculates a confidence score for a proposed task based on its phase classification.

        The confidence score is a simple measure based on the distribution ratio
        of the classified phase. A higher ratio implies higher confidence in that
        type of task within this framework.

        @complexity: O(n*m) due to the call to classify_task.
        @lineage: (σ: "vsql_engine", ρ: "confidence_scoring", γ: "heuristic", κ: O(n*m), λ: ["classify -> score"])

        :param task_description: A natural language string describing the task.
        :return: A confidence score between 0.0 and 1.0.
        """
        classification = self.classify_task(task_description)
        phase = classification["classified_phase"]

        if phase in self.distribution:
            return self.distribution[phase]
        else:
            return 0.0