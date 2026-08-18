import logging
import importlib
from typing import Dict, Any

logger = logging.getLogger(__name__)

_classifier_pipeline = None

CANDIDATE_LABELS = [
    "entertainment",
    "interview",
    "meeting",
    "education",
    "news"
]

def get_classifier_pipeline():
    global _classifier_pipeline
    if _classifier_pipeline is None:
        try:
            transformers_mod = importlib.import_module("transformers")
            pipeline = getattr(transformers_mod, "pipeline")
            logger.info("Loading zero-shot classification pipeline (facebook/bart-large-mnli)...")
            
            device = -1
            try:
                torch_mod = importlib.import_module("torch")
                if torch_mod.cuda.is_available():
                    device = 0
            except Exception:
                device = -1

            _classifier_pipeline = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=device
            )
            logger.info("Zero-shot classification pipeline loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load facebook/bart-large-mnli: {e}. Heuristic classifier active.")
            _classifier_pipeline = False
    return _classifier_pipeline


def classify_content(text: str, filename: str = "") -> Dict[str, Any]:
    """
    Classify transcript into candidate labels: news, entertainment, education, interview, meeting.
    Returns: {"label": "entertainment", "confidence": 0.94}
    """
    if not text or not text.strip():
        return {
            "label": "entertainment",
            "confidence": 0.5
        }

    pipeline = get_classifier_pipeline()
    if pipeline:
        try:
            # Sample first 1500 chars which strongly indicate domain/format
            sample_text = text[:1500]
            result = pipeline(
                sample_text,
                candidate_labels=CANDIDATE_LABELS,
                multi_label=False
            )
            if result and "labels" in result and "scores" in result:
                top_label = result["labels"][0]
                top_score = float(result["scores"][0])
                return {
                    "label": top_label,
                    "confidence": round(top_score, 4)
                }
        except Exception as e:
            logger.error(f"Transformer zero-shot classification error: {e}")

    # Fallback rule/keyword classifier
    combined_text = (filename + " " + text[:5000]).lower()
    
    cue_scores = {
        "entertainment": 0.0,
        "interview": 0.0,
        "meeting": 0.0,
        "education": 0.0,
        "news": 0.0
    }
    
    # Entertainment cues (movie script headings, character actions, scenes)
    if "int." in combined_text or "ext." in combined_text or "scene" in combined_text or "script" in combined_text or "movie" in combined_text:
        cue_scores["entertainment"] += 3.5
    if "dialogue" in combined_text or "cut to:" in combined_text or "fade in:" in combined_text:
        cue_scores["entertainment"] += 3.0

    # Interview cues
    if "interviewer:" in combined_text or "q:" in combined_text or "interview" in combined_text or "welcome to the show" in combined_text:
        cue_scores["interview"] += 3.5
        
    # Meeting cues
    if "meeting" in combined_text or "agenda" in combined_text or "quarterly" in combined_text or "q1" in combined_text or "q2" in combined_text or "q3" in combined_text or "q4" in combined_text or "revenue" in combined_text or "action item" in combined_text:
        cue_scores["meeting"] += 3.5
        
    # Education cues
    if "lecture" in combined_text or "course" in combined_text or "professor" in combined_text or "syllabus" in combined_text or "chapter" in combined_text or "homework" in combined_text:
        cue_scores["education"] += 3.5

    # News cues
    if "reporting live" in combined_text or "headline" in combined_text or "correspondent" in combined_text or "news anchor" in combined_text or "breaking news" in combined_text:
        cue_scores["news"] += 3.5

    # Determine highest
    best_label = max(cue_scores, key=cue_scores.get)
    max_score = cue_scores[best_label]
    
    if max_score > 0:
        confidence = min(0.70 + (max_score * 0.05), 0.96)
    else:
        best_label = "entertainment"
        confidence = 0.65

    return {
        "label": best_label,
        "confidence": round(confidence, 4)
    }
