import httpx
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import logging
from settings import API_URL, API_KEY

nltk.download('vader_lexicon')
nltk.download('stopwords')
analyzer = SentimentIntensityAnalyzer()
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))


def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    filtered_tokens = [token for token in tokens if token not in stop_words]
    lemmatized_tokens = [lemmatizer.lemmatize(token) for token in filtered_tokens]
    return " ".join(lemmatized_tokens)


def get_sentiment(text):
    sentiment = analyzer.polarity_scores(text)
    del sentiment["compound"]
    max_key = max(sentiment, key=sentiment.get)
    return max_key, sentiment[max_key]


def fetch_quote(api_url, api_key):
    response = httpx.get(api_url, headers={"X-Api-Key": api_key})
    response.raise_for_status()
    return response.json()[0]["quote"]


def text_sentiment():
    quote = fetch_quote(API_URL, API_KEY)
    logging.info(f"Quote: {quote}")
    preprocessed_text = preprocess_text(quote)
    sentiment, score = get_sentiment(preprocessed_text)
    logging.info(f"Sentiment: {sentiment} (Score: {score})")
    return {
        "sampleText": quote,
        "result": f"Sentiment: {sentiment} (Score: {score})",
    }
