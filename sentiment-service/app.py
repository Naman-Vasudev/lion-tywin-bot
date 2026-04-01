from fastapi import FastAPI


from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI(title="Tywin Bot Sentiment Service")
analyzer = SentimentIntensityAnalyzer()


class TextRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment: str  # "positive", "negative", or "neutral"
    score: float    # compound score from -1.0 to 1.0


@app.get("/health")
def health():
    return {"status": "alive"}


@app.post("/analyze", response_model=SentimentResponse)
def analyze(req: TextRequest):
    scores = analyzer.polarity_scores(req.text)
    compound = scores["compound"]

    # VADER compound: >= 0.05 positive, <= -0.05 negative, else neutral
    if compound >= 0.05:
        sentiment = "positive"
    elif compound <= -0.05:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return SentimentResponse(sentiment=sentiment, score=compound)
