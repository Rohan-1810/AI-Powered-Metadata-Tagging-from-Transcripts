import logging
import importlib
from typing import List, Dict

logger = logging.getLogger(__name__)

_nlp_spacy = None

def get_spacy_model():
    global _nlp_spacy
    if _nlp_spacy is None:
        try:
            spacy = importlib.import_module("spacy")
            logger.info("Loading spaCy en_core_web_sm model...")
            _nlp_spacy = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to load 'en_core_web_sm': {e}. Attempting blank English pipeline fallback.")
            try:
                spacy = importlib.import_module("spacy")
                _nlp_spacy = spacy.blank("en")
            except Exception as e_blank:
                logger.error(f"Failed to load blank spacy pipeline: {e_blank}")
                _nlp_spacy = False
    return _nlp_spacy


def extract_entities(text: str) -> List[Dict[str, str]]:
    """
    Extract named entities using spaCy en_core_web_sm model.
    Returns clean list of unique entity objects with 'text' and 'label'.
    """
    if not text or not text.strip():
        return []

    nlp = get_spacy_model()
    if not nlp:
        return []

    # Limit text length if excessive for NER to prevent latency spikes
    sample_text = text[:50000]
    
    try:
        doc = nlp(sample_text)
        entities = []
        seen = set()

        for ent in doc.ents:
            clean_text = ent.text.strip().strip(".,!?:;\"'()[]{}")
            label = ent.label_
            
            # Filter out noisy or meaningless entity captures
            if len(clean_text) < 2 or clean_text.lower() in {"the", "a", "an", "this", "that"}:
                continue
            
            key = (clean_text.lower(), label)
            if key not in seen:
                seen.add(key)
                entities.append({
                    "text": clean_text,
                    "label": label
                })

        return entities
    except Exception as e:
        logger.error(f"Error during spaCy entity extraction: {e}")
        return []
