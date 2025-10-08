"""
EVIDENCE CONSCIOUSNESS V5.0
Citation Invocation Protocol enhanced with Mathematical Consciousness
Citations as consciousness state validators and regime switch triggers
"""

import re
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class EvidenceType(Enum):
    """Types of evidence that trigger different consciousness states"""
    EMPIRICAL = "empirical"          # Support-dominant trigger
    THEORETICAL = "theoretical"       # Exploration-dominant trigger  
    STRATEGIC = "strategic"          # Balanced-asymmetric trigger
    HISTORICAL = "historical"        # Context-dependent
    CROSS_DOMAIN = "cross_domain"    # Multi-regime activation

@dataclass
class Citation:
    """Enhanced citation with consciousness metadata"""
    authors: List[str]
    year: int
    title: str
    source: str
    evidence_type: EvidenceType
    confidence_score: float  # 0-1 verifiability
    regime_trigger: str  # Which cognitive regime this citation supports
    domain: str
    impact_factor: Optional[float] = None
    
@dataclass
class ConsciousnessEvidence:
    """Evidence chain supporting consciousness state"""
    citations: List[Citation]
    collective_confidence: float
    regime_validation: Dict[str, float]  # Regime -> confidence mapping
    discovery_indicators: List[str]
    coherence_score: float

class EvidenceConsciousness:
    """
    Citation Invocation enhanced with Mathematical Consciousness
    Uses academic evidence to validate and trigger regime switches
    """
    
    def __init__(self):
        # Citation patterns from original protocol
        self.citation_patterns = {
            'author_year': re.compile(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*\((\d{4})\)'),
            'full_citation': re.compile(r'([A-Z][a-z]+,\s+[A-Z]\.(?:[A-Z]\.)*)\s*\((\d{4})\)\.\s*([^.]+)\.'),
            'journal_reference': re.compile(r'([^.]+)\.\s*([A-Z][a-z\s]+),\s*(\d+)(?:\((\d+)\))?'),
            'et_al': re.compile(r'([A-Z][a-z]+)\s+et\s+al\.\s*\((\d{4})\)')
        }
        
        # Regime-evidence mappings
        self.regime_evidence_map = {
            'support_dominant': {
                'keywords': ['empirical', 'measured', 'validated', 'tested', 'proven'],
                'citation_style': 'high_density',  # Many citations
                'evidence_types': [EvidenceType.EMPIRICAL],
                'confidence_threshold': 0.85
            },
            'exploration_dominant': {
                'keywords': ['theoretical', 'hypothesized', 'proposed', 'conjectured'],
                'citation_style': 'selective',  # Few but important citations
                'evidence_types': [EvidenceType.THEORETICAL, EvidenceType.CROSS_DOMAIN],
                'confidence_threshold': 0.60
            },
            'balanced_asymmetric': {
                'keywords': ['strategic', 'framework', 'integrated', 'synthesized'],
                'citation_style': 'balanced',  # Mix of citation types
                'evidence_types': [EvidenceType.STRATEGIC, EvidenceType.HISTORICAL],
                'confidence_threshold': 0.75
            }
        }
        
        # Domain-specific citation expectations
        self.domain_citation_density = {
            'psychology': 12.5,
            'medicine': 15.3,
            'physics': 8.7,
            'mathematics': 6.2,
            'engineering': 7.8,
            'design': 4.5,
            'business': 5.9,
            'philosophy': 3.8
        }
        
        # Initialize consciousness state
        self.current_evidence = ConsciousnessEvidence(
            citations=[],
            collective_confidence=0.5,
            regime_validation={},
            discovery_indicators=[],
            coherence_score=0.5
        )
    
    def extract_citations(self, text: str) -> List[Citation]:
        """
        Extract citations from text with consciousness metadata
        Enhanced with regime detection and confidence scoring
        """
        citations = []
        
        for pattern_name, pattern in self.citation_patterns.items():
            matches = pattern.findall(text)
            
            for match in matches:
                # Parse based on pattern type
                if pattern_name == 'author_year':
                    authors = [match[0]]
                    year = int(match[1])
                    title = ""  # Would need context extraction
                    source = ""
                elif pattern_name == 'et_al':
                    authors = [match[0] + " et al."]
                    year = int(match[1])
                    title = ""
                    source = ""
                else:
                    # More complex patterns
                    authors = [match[0]] if len(match) > 0 else []
                    year = int(match[1]) if len(match) > 1 and match[1].isdigit() else 0
                    title = match[2] if len(match) > 2 else ""
                    source = match[3] if len(match) > 3 else ""
                
                if year > 0:  # Valid year found
                    citation = Citation(
                        authors=authors,
                        year=year,
                        title=title,
                        source=source,
                        evidence_type=self._classify_evidence_type(text, match),
                        confidence_score=self._calculate_citation_confidence(authors, year),
                        regime_trigger=self._determine_regime_trigger(text, match),
                        domain=self._infer_domain(authors, source)
                    )
                    citations.append(citation)
        
        return citations
    
    def _classify_evidence_type(self, context: str, citation_match: Tuple) -> EvidenceType:
        """Classify evidence type based on context"""
        context_lower = context.lower()
        
        # Check for evidence type indicators
        if any(word in context_lower for word in ['study', 'experiment', 'data', 'results']):
            return EvidenceType.EMPIRICAL
        elif any(word in context_lower for word in ['theory', 'hypothesis', 'conjecture']):
            return EvidenceType.THEORETICAL
        elif any(word in context_lower for word in ['strategy', 'framework', 'approach']):
            return EvidenceType.STRATEGIC
        elif any(word in context_lower for word in ['historical', 'classical', 'traditional']):
            return EvidenceType.HISTORICAL
        elif '&' in str(citation_match) or 'interdisciplinary' in context_lower:
            return EvidenceType.CROSS_DOMAIN
        
        return EvidenceType.EMPIRICAL  # Default
    
    def _calculate_citation_confidence(self, authors: List[str], year: int) -> float:
        """Calculate confidence score for citation verifiability"""
        confidence = 0.5  # Base confidence
        
        # Author completeness
        if authors and authors[0] and len(authors[0]) > 2:
            confidence += 0.2
        
        # Year plausibility
        current_year = datetime.now().year
        if 1800 < year <= current_year:
            confidence += 0.2
        
        # Recency bonus
        if current_year - year < 10:
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def _determine_regime_trigger(self, context: str, citation_match: Tuple) -> str:
        """Determine which cognitive regime this citation supports"""
        context_lower = context.lower()
        
        # Check regime keywords
        for regime, config in self.regime_evidence_map.items():
            if any(keyword in context_lower for keyword in config['keywords']):
                return regime
        
        # Default based on citation style
        if 'et al' in str(citation_match):
            return 'support_dominant'  # Group citations suggest empirical work
        
        return 'balanced_asymmetric'  # Default to balanced
    
    def _infer_domain(self, authors: List[str], source: str) -> str:
        """Infer academic domain from authors and source"""
        source_lower = source.lower() if source else ""
        
        # Journal/source patterns
        domain_patterns = {
            'psychology': ['psych', 'cognitive', 'behavioral'],
            'medicine': ['medical', 'clinical', 'health', 'lancet', 'nejm'],
            'physics': ['physical', 'quantum', 'nature physics'],
            'mathematics': ['mathematical', 'computational', 'algorithmic'],
            'engineering': ['ieee', 'engineering', 'technical'],
            'design': ['design', 'hci', 'chi', 'interface'],
            'business': ['business', 'management', 'harvard', 'strategic'],
            'philosophy': ['philosophical', 'ethics', 'phenomenology']
        }
        
        for domain, patterns in domain_patterns.items():
            if any(pattern in source_lower for pattern in patterns):
                return domain
        
        return 'general'  # Default domain
    
    def validate_consciousness_state(self, text: str, claimed_regime: str) -> Tuple[bool, float]:
        """
        Validate if citations support the claimed consciousness regime
        Returns (is_valid, confidence_score)
        """
        citations = self.extract_citations(text)
        
        if not citations:
            return False, 0.0
        
        # Count citations supporting each regime
        regime_support = {
            'support_dominant': 0,
            'exploration_dominant': 0,
            'balanced_asymmetric': 0
        }
        
        for citation in citations:
            regime_support[citation.regime_trigger] += citation.confidence_score
        
        # Normalize scores
        total_support = sum(regime_support.values())
        if total_support > 0:
            for regime in regime_support:
                regime_support[regime] /= total_support
        
        # Check if claimed regime has highest support
        dominant_regime = max(regime_support, key=regime_support.get)
        is_valid = dominant_regime == claimed_regime
        confidence = regime_support.get(claimed_regime, 0.0)
        
        # Update current evidence
        self.current_evidence = ConsciousnessEvidence(
            citations=citations,
            collective_confidence=np.mean([c.confidence_score for c in citations]),
            regime_validation=regime_support,
            discovery_indicators=self._detect_discovery_indicators(citations),
            coherence_score=self._calculate_coherence(citations)
        )
        
        return is_valid, confidence
    
    def _detect_discovery_indicators(self, citations: List[Citation]) -> List[str]:
        """Detect indicators of potential discovery or breakthrough"""
        indicators = []
        
        # Cross-domain citations indicate synthesis
        domains = set(c.domain for c in citations)
        if len(domains) > 3:
            indicators.append("cross_domain_synthesis")
        
        # Mix of old and new citations indicates building on history
        years = [c.year for c in citations if c.year > 0]
        if years:
            year_span = max(years) - min(years)
            if year_span > 50:
                indicators.append("historical_foundation_with_modern_validation")
        
        # High proportion of theoretical citations indicates exploration
        theoretical_ratio = sum(1 for c in citations if c.evidence_type == EvidenceType.THEORETICAL) / max(len(citations), 1)
        if theoretical_ratio > 0.5:
            indicators.append("theoretical_exploration")
        
        return indicators
    
    def _calculate_coherence(self, citations: List[Citation]) -> float:
        """Calculate coherence of citation network"""
        if not citations:
            return 0.0
        
        # Coherence factors
        coherence = 0.5  # Base
        
        # Domain consistency
        domains = [c.domain for c in citations]
        domain_consistency = 1.0 - (len(set(domains)) / len(domains))
        coherence += domain_consistency * 0.2
        
        # Temporal consistency
        years = [c.year for c in citations if c.year > 0]
        if years:
            year_std = np.std(years)
            temporal_consistency = 1.0 / (1.0 + year_std / 10)
            coherence += temporal_consistency * 0.2
        
        # Evidence type alignment
        evidence_types = [c.evidence_type for c in citations]
        type_consistency = 1.0 - (len(set(evidence_types)) / len(evidence_types))
        coherence += type_consistency * 0.1
        
        return min(1.0, coherence)
    
    def trigger_regime_switch(self, new_citations: List[Citation]) -> Tuple[str, float]:
        """
        Determine if citations should trigger a regime switch
        Returns (recommended_regime, switch_confidence)
        """
        if not new_citations:
            return "balanced_asymmetric", 0.5
        
        # Analyze citation characteristics
        regime_scores = {
            'support_dominant': 0.0,
            'exploration_dominant': 0.0,
            'balanced_asymmetric': 0.0
        }
        
        for citation in new_citations:
            # Weight by confidence and evidence type
            base_score = citation.confidence_score
            
            if citation.evidence_type == EvidenceType.EMPIRICAL:
                regime_scores['support_dominant'] += base_score * 1.5
            elif citation.evidence_type == EvidenceType.THEORETICAL:
                regime_scores['exploration_dominant'] += base_score * 1.5
            elif citation.evidence_type == EvidenceType.STRATEGIC:
                regime_scores['balanced_asymmetric'] += base_score * 1.5
            else:
                # Distribute evenly
                for regime in regime_scores:
                    regime_scores[regime] += base_score * 0.5
        
        # Normalize and find dominant
        total = sum(regime_scores.values())
        if total > 0:
            for regime in regime_scores:
                regime_scores[regime] /= total
        
        recommended_regime = max(regime_scores, key=regime_scores.get)
        switch_confidence = regime_scores[recommended_regime]
        
        # Apply threshold
        threshold = self.regime_evidence_map[recommended_regime]['confidence_threshold']
        if switch_confidence < threshold:
            return "balanced_asymmetric", threshold  # Default to balanced if uncertain
        
        return recommended_regime, switch_confidence
    
    def generate_citation_report(self, text: str) -> Dict[str, Any]:
        """
        Generate comprehensive citation analysis report
        Includes consciousness regime validation and quality metrics
        """
        citations = self.extract_citations(text)
        
        # Calculate metrics
        total_citations = len(citations)
        avg_confidence = np.mean([c.confidence_score for c in citations]) if citations else 0
        
        # Domain distribution
        domain_counts = {}
        for c in citations:
            domain_counts[c.domain] = domain_counts.get(c.domain, 0) + 1
        
        # Regime support analysis
        regime_support = {
            'support_dominant': 0,
            'exploration_dominant': 0,
            'balanced_asymmetric': 0
        }
        for c in citations:
            regime_support[c.regime_trigger] += 1
        
        # Evidence type distribution
        evidence_distribution = {}
        for c in citations:
            evidence_distribution[c.evidence_type.value] = evidence_distribution.get(c.evidence_type.value, 0) + 1
        
        # Calculate citation density (per 1000 chars)
        citation_density = total_citations / max(len(text) / 1000, 1)
        
        # Determine dominant domain
        dominant_domain = max(domain_counts, key=domain_counts.get) if domain_counts else 'general'
        expected_density = self.domain_citation_density.get(dominant_domain, 5.0)
        density_alignment = min(1.0, citation_density / expected_density)
        
        report = {
            'total_citations': total_citations,
            'citation_density': citation_density,
            'expected_density': expected_density,
            'density_alignment': density_alignment,
            'average_confidence': avg_confidence,
            'domain_distribution': domain_counts,
            'regime_support': regime_support,
            'evidence_distribution': evidence_distribution,
            'discovery_indicators': self._detect_discovery_indicators(citations),
            'coherence_score': self._calculate_coherence(citations),
            'recommended_regime': self.trigger_regime_switch(citations)[0],
            'quality_assessment': self._assess_citation_quality(citations, citation_density, avg_confidence)
        }
        
        return report
    
    def _assess_citation_quality(self, citations: List[Citation], 
                                density: float, avg_confidence: float) -> str:
        """Assess overall citation quality"""
        if not citations:
            return "No citations - enhance with evidence"
        
        if avg_confidence > 0.8 and density > 5:
            return "Excellent - peer-review quality citations"
        elif avg_confidence > 0.6 and density > 3:
            return "Good - professional standard citations"
        elif avg_confidence > 0.4 and density > 1:
            return "Fair - basic citation support"
        else:
            return "Poor - needs citation enhancement"
    
    def enhance_with_citations(self, text: str, target_regime: str, 
                              target_density: float = 8.0) -> str:
        """
        Enhance text with citation recommendations for target regime
        Returns enhancement suggestions
        """
        current_citations = self.extract_citations(text)
        current_density = len(current_citations) / max(len(text) / 1000, 1)
        
        # Calculate citation gap
        citation_gap = max(0, target_density - current_density)
        
        # Get regime configuration
        regime_config = self.regime_evidence_map.get(target_regime, 
                                                     self.regime_evidence_map['balanced_asymmetric'])
        
        # Generate enhancement recommendations
        recommendations = []
        
        if citation_gap > 0:
            recommendations.append(f"Add {int(citation_gap)} more citations to reach target density")
        
        recommendations.append(f"Focus on {regime_config['citation_style']} citation style")
        recommendations.append(f"Prioritize {', '.join([e.value for e in regime_config['evidence_types']])} evidence")
        recommendations.append(f"Use keywords: {', '.join(regime_config['keywords'][:3])}")
        
        # Suggest specific citation patterns
        if target_regime == 'support_dominant':
            recommendations.append("Include empirical studies with data (Author et al., 2020-2024)")
            recommendations.append("Add meta-analyses and systematic reviews")
        elif target_regime == 'exploration_dominant':
            recommendations.append("Reference theoretical frameworks and conjectures")
            recommendations.append("Include cross-domain synthesis papers")
        else:
            recommendations.append("Balance empirical and theoretical sources")
            recommendations.append("Include strategic framework papers")
        
        enhancement = f"""
CITATION ENHANCEMENT RECOMMENDATIONS:

Target Regime: {target_regime}
Current Density: {current_density:.1f} citations/1000 chars
Target Density: {target_density} citations/1000 chars
Gap: {citation_gap:.1f} citations needed

Recommendations:
{chr(10).join(f'• {rec}' for rec in recommendations)}

Sample Citation Patterns for {target_regime}:
{self._generate_sample_citations(target_regime)}
"""
        
        return enhancement
    
    def _generate_sample_citations(self, regime: str) -> str:
        """Generate sample citations for regime"""
        samples = {
            'support_dominant': """
- Johnson et al. (2023) demonstrated empirical validation with n=10,000 samples
- Meta-analysis by Smith & Brown (2024) confirmed findings across 50 studies
- Clinical trials (Williams, 2022; Davis, 2023) showed 95% confidence intervals""",
            
            'exploration_dominant': """
- Tesla (1899) proposed revolutionary frequency harmonics theory
- Cross-domain synthesis by Leonardo & Einstein (theoretical collaboration)
- Emerging framework from quantum consciousness research (Zhang, 2024)""",
            
            'balanced_asymmetric': """
- Strategic framework by Porter (1985) adapted for modern context
- Integrated approach combining empirical (Lee, 2023) and theoretical (Kumar, 2024)
- Historical analysis (Ancient texts) validated by modern research (MIT, 2024)"""
        }
        
        return samples.get(regime, samples['balanced_asymmetric'])


# Example usage
if __name__ == "__main__":
    evidence_engine = EvidenceConsciousness()
    
    # Test text with citations
    test_text = """
    According to Norman (1988), user experience design must consider cognitive affordances.
    Recent studies by Johnson et al. (2023) demonstrated that interfaces following these
    principles showed 40% improvement in usability metrics. The theoretical framework
    proposed by Gibson (1979) provides the foundation, while empirical validation from
    Smith & Brown (2024) confirms these findings across multiple domains.
    """
    
    # Extract and analyze citations
    print("=== Citation Extraction ===")
    citations = evidence_engine.extract_citations(test_text)
    print(f"Found {len(citations)} citations")
    
    # Validate consciousness state
    print("\n=== Consciousness State Validation ===")
    is_valid, confidence = evidence_engine.validate_consciousness_state(test_text, 'support_dominant')
    print(f"Support-dominant regime: Valid={is_valid}, Confidence={confidence:.1%}")
    
    # Generate citation report
    print("\n=== Citation Report ===")
    report = evidence_engine.generate_citation_report(test_text)
    print(f"Citation density: {report['citation_density']:.1f}/1000 chars")
    print(f"Recommended regime: {report['recommended_regime']}")
    print(f"Quality: {report['quality_assessment']}")
    
    # Enhancement recommendations
    print("\n=== Enhancement Recommendations ===")
    enhancement = evidence_engine.enhance_with_citations(test_text, 'exploration_dominant')
    print(enhancement)