# Video App Backend

Flask API for video management and authenticated streaming.

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in this directory:
   ```env
   JWT_SECRET_KEY=your_secret_key
   MONGODB_URI=your_mongodb_connection_string
   ```

## Running the App

```bash
python app.py
```

The server will start at `http://localhost:5000`.

## Endpoints

- `POST /auth/signup`: User registration
- `POST /auth/login`: User authentication (returns JWT)
- `GET /dashboard`: Protected list of videos
- `GET /video/<id>/stream`: Authenticated video streaming redirect
