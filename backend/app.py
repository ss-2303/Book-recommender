from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, static_folder="static")

# ---------- Load data + build model once ----------
df = pd.read_csv("Book_Details_cleaned2.csv")

# Make sure these columns exist (adjust if your CSV uses different names)
# Expected: book_title, book_details (or your combined "content")
if "content" not in df.columns:
    df["content"] = (
        df.get("genres", "").fillna("").astype(str) + " " +
        df.get("author", "").fillna("").astype(str) + " " +
        df.get("book_details", "").fillna("").astype(str)
    )

df["book_title"] = df["book_title"].fillna("").astype(str)
df["content"] = df["content"].fillna("").astype(str)
df = df[df["content"].str.strip().astype(bool)].reset_index(drop=True)

tfidf = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.85,
    norm="l2"
)
X = tfidf.fit_transform(df["content"])

DISPLAY_TITLE_COL = "book_title_original"   
DISPLAY_AUTHOR_COL = "author_original" # change to your column name
Summary = "book_details_original"
def recommend_top5_cosine(query_text, top_n=5, exclude_title_match=True):
    if not isinstance(query_text, str) or not query_text.strip():
        return []

    q_raw = query_text.strip()
    q = q_raw.lower()

    q_vec = tfidf.transform([q])
    sims = cosine_similarity(q_vec, X).ravel()

    # Exclude the book itself if query matches an original title
    if exclude_title_match:
        # match against original display title if available, else fallback to cleaned
        title_col_for_exclusion = DISPLAY_TITLE_COL if DISPLAY_TITLE_COL in df.columns else "book_title"

        # Find exact matches (case-insensitive)
        mask = df[title_col_for_exclusion].astype(str).str.lower().str.strip().eq(q)

        # If exact match exists, exclude all those rows (handles duplicates)
        if mask.any():
            sims[mask.values] = -1

    sims[sims >= 0.999999] = -1

    # take more than top_n then filter (helps when you exclude items)

    top_idx = np.argsort(sims)[::-1][:top_n]
    top_idx = top_idx[sims[top_idx] > -1]

    return (
        df.iloc[top_idx][[DISPLAY_TITLE_COL, DISPLAY_AUTHOR_COL,Summary, "cover_image_uri"]]
          .rename(columns={DISPLAY_TITLE_COL: "title", DISPLAY_AUTHOR_COL: "author", Summary: "description","cover_image_uri": "cover_image"})
          .assign(score=sims[top_idx])
          .to_dict("records")
    )



# ---------- API ----------
@app.get("/api/recommend")
def api_recommend():
    title = request.args.get("title", "", type=str)
    recs = recommend_top5_cosine(title, top_n=5)
    return jsonify({
        "query": title,
        "recommendations": recs
    })

# ---------- Frontend ----------
@app.get("/")
def home():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(debug=True)
