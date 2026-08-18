from typing import List, Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Raw transcript text to analyze")
    filename: Optional[str] = Field(default="", description="Original filename if available")


class EntityItem(BaseModel):
    text: str
    label: str


class SentimentResult(BaseModel):
    polarity: str  # positive, negative, neutral
    score: float   # compound score between -1.0 and 1.0


class EmotionItem(BaseModel):
    label: str
    score: float


class SpeakerItem(BaseModel):
    speaker: str
    lineCount: int


class SegmentItem(BaseModel):
    index: int
    heading: str
    text: str


class CategoryResult(BaseModel):
    label: str
    confidence: float


class AnalyzeResponse(BaseModel):
    keywords: List[str]
    entities: List[EntityItem]
    sentiment: SentimentResult
    emotions: List[EmotionItem]
    speakers: List[SpeakerItem]
    segments: List[SegmentItem]
    category: CategoryResult
