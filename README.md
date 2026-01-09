Book Recommendations
The system is a Content-based recommender that represents books using TF-IDF vectors derived from titles and descriptions. User input is mapped into the same feature space, and cosine similarity (or Euclidean distance) is used to compute content similarity between books. The top-5 most similar books are then ranked and returned as recommendations.
The first search will take some time due to backend rendering.
The report for the Hybrid Model, which takes into account the user profile, history, and content-based metrics to generate recommendations, can be read here - https://github.com/ss-2303/Book-Recommender-System-Hybrid-Model-Report . The report walks through each step from data pre-processing and cleaning, and then explains various model and their respective evaluation metrics.


Model Disclaimer — Book Recommendation System
This book recommendation system is a prototype intended for demonstration and learning purposes only. Recommendations and similarity scores are approximate and should not be considered definitive or relied upon for critical decisions.

Model Methodology: Recommendations are generated using a content-based TF-IDF model that compares book titles and descriptions.
Dataset & Coverage: The model is trained on a random subset of approximately 5,000 books and does not represent the full Goodreads catalog.
Accuracy Limitations: Due to dataset size and limited diversity, similarity scores may be noisy, incomplete, biased, or inaccurate.
Personalization: This system is not a hybrid recommender and does not use collaborative filtering, user behavior, or personalization signals.
Future Improvements: Planned enhancements include improved handling of unseen titles via structured metadata generation (e.g., LLM-assisted enrichment, embedment and vector database updates) to increase accuracy and coverage.
Input Constraints: If a user enters a book title not present in the dataset, recommendations are derived solely from the textual input, which may significantly reduce accuracy.
Performance Notice: The backend is hosted on Render and may experience cold starts. Initial requests can take up to ~60 seconds while the service wakes up.
Liability: The creators accept no responsibility for decisions made based on the system’s outputs or for any direct or indirect consequences of its use.
