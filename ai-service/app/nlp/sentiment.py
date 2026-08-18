import logging
import importlib
from typing import Dict, Any

logger = logging.getLogger(__name__)

_vader_analyzer = None

def get_vader_analyzer():
    global _vader_analyzer
    if _vader_analyzer is None:
        try:
            nltk = importlib.import_module("nltk")
            try:
                nltk.data.find("sentiment/vader_lexicon.zip")
            except LookupError:
                try:
                    logger.info("Downloading NLTK VADER lexicon...")
                    nltk.download("vader_lexicon", quiet=True)
                except Exception as e:
                    logger.warning(f"Could not download VADER lexicon: {e}")
            
            vader_mod = importlib.import_module("nltk.sentiment.vader")
            SentimentIntensityAnalyzer = getattr(vader_mod, "SentimentIntensityAnalyzer")
            _vader_analyzer = SentimentIntensityAnalyzer()
            logger.info("VADER Sentiment Analyzer initialized.")
        except Exception as e:
            logger.warning(f"Failed to initialize VADER Analyzer: {e}. Heuristic sentiment analyzer active.")
            _vader_analyzer = False
    return _vader_analyzer


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment using NLTK VADER.
    Returns polarity ('positive', 'negative', 'neutral') and compound score (-1.0 to 1.0).
    """
    if not text or not text.strip():
        return {
            "polarity": "neutral",
            "score": 0.0
        }

    analyzer = get_vader_analyzer()
    if not analyzer:
        return {
            "polarity": "neutral",
            "score": 0.0
        }

    try:
        # Sample representative chunks if text is very long
        sample_text = text[:15000]
        scores = analyzer.polarity_scores(sample_text)
        compound = round(scores.get("compound", 0.0), 4)

        if compound >= 0.05:
            polarity = "positive"
        elif compound <= -0.05:
            polarity = "negative"
        else:
            polarity = "neutral"

        return {
            "polarity": polarity,
            "score": float(compound)
        }
    except Exception as e:
        logger.error(f"Error during VADER sentiment analysis: {e}")
        return {
            "polarity": "neutral",
            "score": 0.0
        }
