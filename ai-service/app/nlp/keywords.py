import logging
import importlib
import re
from typing import List

logger = logging.getLogger(__name__)

_kw_model = None

def get_keybert_model():
    global _kw_model
    if _kw_model is None:
        try:
            keybert_module = importlib.import_module("keybert")
            KeyBERT = getattr(keybert_module, "KeyBERT")
            logger.info("Initializing KeyBERT model...")
            _kw_model = KeyBERT(model="all-MiniLM-L6-v2")
            logger.info("KeyBERT model initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to load KeyBERT model: {e}")
            _kw_model = False
    return _kw_model


def extract_keywords(text: str, top_n: int = 8) -> List[str]:
    """
    Extract key phrases and keywords using KeyBERT with stopword filtering and deduplication.
    """
    if not text or not text.strip():
        return []

    cleaned_text = re.sub(r'[\r\n\t]+', ' ', text).strip()
    if len(cleaned_text.split()) < 3:
        words = [w.strip(".,!?:;\"'()[]{}") for w in cleaned_text.split() if len(w) > 2]
        return list(dict.fromkeys(words))[:top_n]

    model = get_keybert_model()
    if model:
        try:
            extracted = model.extract_keywords(
                cleaned_text,
                keyphrase_ngram_range=(1, 2),
                stop_words="english",
                use_maxsum=True,
                nr_candidates=20,
                top_n=top_n
            )
            keywords = [kw[0].strip().lower() for kw in extracted if kw[0].strip()]
            # Deduplicate preserving order
            seen = set()
            unique_keywords = []
            for kw in keywords:
                if kw not in seen and len(kw) > 2:
                    seen.add(kw)
                    unique_keywords.append(kw)
            if unique_keywords:
                return unique_keywords
        except Exception as e:
            logger.warning(f"KeyBERT extraction failed, falling back to TF-IDF extraction: {e}")

    # Fallback to TF-IDF / frequency based extraction
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=top_n * 2
        )
        tfidf_matrix = vectorizer.fit_transform([cleaned_text])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        sorted_indices = scores.argsort()[::-1]
        
        fallback_keywords = []
        for idx in sorted_indices:
            kw = feature_names[idx].strip()
            if kw and kw not in fallback_keywords and len(kw) > 2:
                fallback_keywords.append(kw)
            if len(fallback_keywords) >= top_n:
                break
        return fallback_keywords
    except Exception as e:
        logger.error(f"Fallback keyword extraction failed: {e}")
        # Simplest token frequency fallback
        words = re.findall(r'\b[a-zA-Z]{3,}\b', cleaned_text.lower())
        stop_words = {"the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his", "from", "they", "say", "her", "she", "will", "one", "all", "would", "there", "their", "what"}
        freq = {}
        for w in words:
            if w not in stop_words:
                freq[w] = freq.get(w, 0) + 1
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w[0] for w in sorted_words[:top_n]]
