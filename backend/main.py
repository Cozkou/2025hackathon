from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import paper_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routers
app.include_router(paper_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to StudentTools API"}
