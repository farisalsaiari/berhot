from fastapi import FastAPI
from contextlib import asynccontextmanager

app = FastAPI(
    title="Berhot Marketing Service",
    version="0.1.0",
    docs_url="/api/v1/marketing/docs",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Marketing service starting...")
    yield
    # Shutdown
    print("Marketing service shutting down...")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "marketing"}


@app.get("/api/v1/marketing/campaigns")
async def list_campaigns(tenant_id: str = None):
    return {"campaigns": [], "total": 0}


@app.post("/api/v1/marketing/campaigns")
async def create_campaign(tenant_id: str = None):
    return {"id": "new-campaign", "status": "draft"}


@app.get("/api/v1/marketing/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    return {"id": campaign_id, "status": "draft"}


@app.post("/api/v1/marketing/campaigns/{campaign_id}/send")
async def send_campaign(campaign_id: str):
    return {"id": campaign_id, "status": "sending"}


@app.get("/api/v1/marketing/audiences")
async def list_audiences():
    return {"audiences": []}


@app.post("/api/v1/marketing/audiences")
async def create_audience():
    return {"id": "new-audience"}


@app.get("/api/v1/marketing/templates")
async def list_templates():
    return {"templates": []}


@app.get("/api/v1/marketing/analytics")
async def get_analytics():
    return {"sent": 0, "opened": 0, "clicked": 0, "converted": 0}
