from fastapi import FastAPI # brings the main class FastAPI
from fastapi.middleware.cors import CORSMiddleware # tool that gives the web access to this api

app = FastAPI(
    title = "Study Habit Tracker",
    description = "API that Tracks and analyzes study habits",
    version = "1.0.0"
) #main object of the web api server

app.add_middleware(
    CORSMiddleware, # CORS => web browser security protocol
    allow_origins = ["https://localhost:3000"], # allow access to the api at this URL.
    allow_credentials = True, # allows request for credentials (cookies, authorization header and ...)
    allow_methods = ["*"], # allows every http methods (GET, POST, PUT, DELETE)
    allow_headers = ["*"], # allows every header
)

@app.get("/") # if the root directory(backend) receives get request,
def read_root(): # execute this function
    return{
        "message": "Welcome to Study Habit Tracker API!",
        "version": "1.0.0",
        "docs": "/docs"
    } # welcome message in JSON format

@app.get("/health")
def health_check():
    return{
        "status": "The server is operating normally. "
    }

@app.get("/test")
def test_api():
    return{
        "message": "Test successful."
    }

if __name__ == "__main__": # run the code below only when this file is ran
    import uvicorn # server program that excutes FastAPI
    uvicorn.run(app, host = "0.0.0.0", port = 8000, reload = True) # server starts at port num 8000, reload = True means the server automatically reloads when code has been modified.