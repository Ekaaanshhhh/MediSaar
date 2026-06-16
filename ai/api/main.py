from fastapi import FastAPI
from loguru import logger

from ai.api.routes.upload import router as upload_router

app = FastAPI(
    title="MediSaar API",
    description="AI-Powered Cross-Hospital Patient Record System",
    version="1.0.0"
)



# Include Routes

app.include_router(upload_router)



# Root Route

@app.get("/")
async def root():
    return {
        "message": "MediSaar API Running",
        "status": "success"
    }



# Health Check

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "MediSaar Backend"
    }



# Startup Event

@app.on_event("startup")
async def startup_event():
    logger.info("MediSaar API Started")



# Shutdown Event

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("MediSaar API Stopped")

