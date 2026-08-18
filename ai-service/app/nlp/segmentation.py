import re
from typing import List, Dict, Any

def segment_transcript(text: str) -> List[Dict[str, Any]]:
    """
    Segment transcript based on scene headings (INT./EXT.), timestamps, or dialogue blocks.
    Preserves actual timestamp information when present. Never invents timestamps.
    """
    if not text or not text.strip():
        return []

    lines = text.splitlines()
    
    # Check 1: Movie script scene headings: INT., EXT., INT/EXT, SCENE 1
    scene_heading_regex = re.compile(
        r'^\s*(INT\.|EXT\.|INT/EXT\.|INT\s*/\s*EXT\.|SCENE\s+\d+|PROLOGUE|EPILOGUE)\b.*$',
        re.IGNORECASE
    )

    # Check 2: Timestamp markers: [00:01:23], 00:01:23, 01:23 - 02:45
    timestamp_regex = re.compile(
        r'^\s*(?:\[|\()?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?)?)(?:\]|\))?\s*(?:[-–—:]\s*(.*))?$'
    )

    segments = []
    current_heading = None
    current_lines = []
    
    has_explicit_scenes = any(scene_heading_regex.match(line) for line in lines)
    has_explicit_timestamps = any(timestamp_regex.match(line) for line in lines)

    if has_explicit_scenes:
        index = 1
        for line in lines:
            if scene_heading_regex.match(line):
                if current_heading is not None and current_lines:
                    segments.append({
                        "index": index,
                        "heading": current_heading,
                        "text": "\n".join(current_lines).strip()
                    })
                    index += 1
                    current_lines = []
                current_heading = line.strip()
            else:
                if current_heading is not None:
                    current_lines.append(line)
                else:
                    # Content before first scene heading
                    if line.strip():
                        current_lines.append(line)
        
        if current_heading or current_lines:
            segments.append({
                "index": index,
                "heading": current_heading if current_heading else "Prologue / Introduction",
                "text": "\n".join(current_lines).strip()
            })
        return segments

    elif has_explicit_timestamps:
        index = 1
        for line in lines:
            ts_match = timestamp_regex.match(line)
            if ts_match:
                if current_heading is not None and current_lines:
                    segments.append({
                        "index": index,
                        "heading": current_heading,
                        "text": "\n".join(current_lines).strip()
                    })
                    index += 1
                    current_lines = []
                ts_val = ts_match.group(1)
                extra = ts_match.group(2)
                current_heading = f"Timestamp [{ts_val}]" + (f" - {extra}" if extra else "")
            else:
                if current_heading is not None:
                    current_lines.append(line)
                else:
                    if line.strip():
                        current_lines.append(line)
                        
        if current_heading or current_lines:
            segments.append({
                "index": index,
                "heading": current_heading if current_heading else "Introduction",
                "text": "\n".join(current_lines).strip()
            })
        return segments

    # For general conversational text or scripts without headers: segment by speaker changes or paragraph blocks
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paragraphs) <= 1:
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

    # Group into chunks of 3-5 blocks or max 5 segments for clear visualization
    chunk_size = max(1, len(paragraphs) // 4) if len(paragraphs) > 4 else 1
    segments = []
    
    for i in range(0, len(paragraphs), chunk_size):
        chunk = paragraphs[i:i + chunk_size]
        first_line = chunk[0].splitlines()[0] if chunk else ""
        heading = f"Segment {len(segments) + 1}"
        if ":" in first_line:
            spk = first_line.split(":")[0].strip()
            if len(spk) < 25:
                heading = f"Segment {len(segments) + 1}: {spk} Dialogue"
        
        segments.append({
            "index": len(segments) + 1,
            "heading": heading,
            "text": "\n\n".join(chunk).strip()
        })

    return segments if segments else [{
        "index": 1,
        "heading": "Complete Transcript",
        "text": text.strip()
    }]
