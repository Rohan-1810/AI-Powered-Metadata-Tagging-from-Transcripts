import re
from typing import List, Dict, Any

# Common False positives in scripts (stage directions, transitions, scene tags)
EXCLUDED_KEYWORDS = {
    "INT", "EXT", "INT/EXT", "CONTINUOUS", "NIGHT", "DAY", "DUSK", "DAWN",
    "FADE IN", "FADE OUT", "CUT TO", "DISSOLVE TO", "FLASHBACK", "SCENE",
    "THE END", "ACT ONE", "ACT TWO", "ACT THREE", "TRANSCRIPT", "NOTE", "TITLE"
}

def identify_speakers(text: str) -> List[Dict[str, Any]]:
    """
    Identifies speakers and counts dialogue turns using regex rules.
    If no recognizable dialogue speakers exist, returns empty list without fabricating.
    """
    if not text or not text.strip():
        return []

    lines = text.splitlines()
    speaker_counts: Dict[str, int] = {}

    # Pattern 1: Inline speaker with colon: "JOHN: Hello there" or "DR. SEAN MAGUIRE (V.O.): What occurred..."
    pattern_colon = re.compile(r'^\s*([A-Z0-9\.\'\s\-]{2,30}?)(?:\s*\([A-Za-z0-9\.\s]+\))?\s*:\s*(.*)$')
    
    # Pattern 2: Script standard centered uppercase character name on its own line:
    # "       TRINITY"
    # "I'm inside the mainframe."
    pattern_standalone = re.compile(r'^\s{0,20}([A-Z][A-Z0-9\.\'\s\-]{1,25})(?:\s*\([A-Za-z0-9\.\s]+\))?\s*$')

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        match_colon = pattern_colon.match(line)
        if match_colon:
            raw_speaker = match_colon.group(1).strip()
            # Clean parentheses if any remain
            clean_speaker = re.sub(r'\s*\([^)]*\)', '', raw_speaker).strip()
            if clean_speaker and clean_speaker.upper() not in EXCLUDED_KEYWORDS and len(clean_speaker) <= 30:
                speaker_counts[clean_speaker] = speaker_counts.get(clean_speaker, 0) + 1
            i += 1
            continue

        # Check standalone script character header (must be followed by dialogue on next non-empty line)
        match_standalone = pattern_standalone.match(line)
        if match_standalone and stripped.isupper():
            candidate = match_standalone.group(1).strip()
            clean_candidate = re.sub(r'\s*\([^)]*\)', '', candidate).strip()
            
            if (
                clean_candidate
                and clean_candidate.upper() not in EXCLUDED_KEYWORDS
                and not clean_candidate.startswith("INT.")
                and not clean_candidate.startswith("EXT.")
                and len(clean_candidate.split()) <= 4
            ):
                # Verify next line is dialogue (not another scene header)
                if i + 1 < len(lines):
                    next_line = lines[i+1].strip()
                    if next_line and not next_line.startswith("INT.") and not next_line.startswith("EXT."):
                        speaker_counts[clean_candidate] = speaker_counts.get(clean_candidate, 0) + 1
                        i += 2
                        continue

        i += 1

    # Convert to response schema
    results = [
        {"speaker": spk, "lineCount": count}
        for spk, count in speaker_counts.items()
        if count >= 1
    ]

    # Sort descending by lineCount
    results.sort(key=lambda x: x["lineCount"], reverse=True)
    return results
