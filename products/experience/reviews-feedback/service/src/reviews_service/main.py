from fastapi import FastAPI

app = FastAPI(title="Berhot Reviews & Feedback", version="0.1.0")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "reviews-feedback"}

@app.get("/api/v1/reviews")
async def list_reviews(tenant_id: str = None):
    return {"reviews": [], "average_rating": 0}

@app.post("/api/v1/reviews")
async def create_review():
    return {"id": "new-review", "status": "pending"}

@app.get("/api/v1/reviews/analytics")
async def get_review_analytics():
    return {"total": 0, "average": 0, "distribution": {}}
