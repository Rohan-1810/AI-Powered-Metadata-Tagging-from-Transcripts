import logging
import importlib
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

_emotion_pipeline = None

def get_emotion_pipeline():
    global _emotion_pipeline
    if _emotion_pipeline is None:
        try:
            transformers_mod = importlib.import_module("transformers")
            pipeline = getattr(transformers_mod, "pipeline")
            logger.info("Loading emotion classification pipeline (j-hartmann/emotion-english-distilroberta-base)...")
            
            device = -1
            try:
                torch_mod = importlib.import_module("torch")
                if torch_mod.cuda.is_available():
                    device = 0
            except Exception:
                device = -1

            _emotion_pipeline = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,
                device=device,
                truncation=True,
                max_length=512
            )
            logger.info("Emotion classification pipeline loaded.")
        except Exception as e:
            logger.warning(f"Could not load HuggingFace emotion model: {e}. Fallback emotion heuristic will be active.")
            _emotion_pipeline = False
    return _emotion_pipeline


def analyze_emotions(text: str) -> List[Dict[str, Any]]:
    """
    Extract emotion distribution using DistilRoBERTa emotion classifier.
    Returns list of dicts: [{"label": "joy", "score": 0.85}, ...]
    """
    if not text or not text.strip():
        return [
            {"label": "neutral", "score": 1.0},
            {"label": "joy", "score": 0.0},
            {"label": "sadness", "score": 0.0},
            {"label": "anger", "score": 0.0},
            {"label": "fear", "score": 0.0},
            {"label": "surprise", "score": 0.0},
            {"label": "disgust", "score": 0.0}
        ]

    nlp_pipeline = get_emotion_pipeline()
    if nlp_pipeline:
        try:
            # Chunking long transcripts into representative segments
            paragraphs = [p.strip() for p in text.split('\n') if len(p.strip()) > 20]
            if not paragraphs:
                paragraphs = [text[:1000]]
            
            sample_paragraphs = paragraphs[:5]
            aggregated_scores: Dict[str, float] = {}

            for p in sample_paragraphs:
                results = nlp_pipeline(p[:500])
                if results and isinstance(results, list):
                    item_scores = results[0] if isinstance(results[0], list) else results
                    for entry in item_scores:
                        lbl = entry["label"].lower()
                        score = float(entry["score"])
                        aggregated_scores[lbl] = aggregated_scores.get(lbl, 0.0) + score

            count = max(len(sample_paragraphs), 1)
            formatted = []
            for lbl, total_score in aggregated_scores.items():
                formatted.append({
                    "label": lbl,
                    "score": round(total_score / count, 4)
                })

            # Sort descending by score
            formatted.sort(key=lambda x: x["score"], reverse=True)
            if formatted:
                return formatted
        except Exception as e:
            logger.error(f"Error during transformer emotion inference: {e}")

    # Fallback heuristic using emotion lexicon keywords
    lower_text = text.lower()
    lexicons = {
        "joy": ["happy", "great", "excellent", "love", "excited", "wonderful", "glad", "laugh", "smile", "success", "delight", "cheer"],
        "sadness": ["sad", "depressed", "sorrow", "grief", "cry", "mourn", "hurt", "unhappy", "pain", "loss", "tragic", "tear"],
        "anger": ["angry", "furious", "hate", "rage", "mad", "irritated", "fight", "kill", "destroy", "annoyed", "threat"],
        "fear": ["afraid", "fear", "scared", "terror", "danger", "panic", "horrified", "dread", "worry", "alarm"],
        "surprise": ["surprise", "shock", "unexpected", "astonished", "wow", "unbelievable", "amazing", "suddenly"],
        "disgust": ["disgust", "nasty", "gross", "revolting", "horrible", "vile", "offensive", "sick"],
        "neutral": ["is", "the", "are", "we", "okay", "alright", "proceed", "meeting", "normal", "said", "note"]
    }
    
    raw_scores = {}
    for emo, words in lexicons.items():
        score = sum(lower_text.count(w) for w in words)
        raw_scores[emo] = score + (1.0 if emo == "neutral" else 0.1)

    total = sum(raw_scores.values()) or 1.0
    fallback_res = [
        {"label": emo, "score": round(score / total, 4)}
        for emo, score in raw_scores.items()
    ]
    fallback_res.sort(key=lambda x: x["score"], reverse=True)
    return fallback_res
