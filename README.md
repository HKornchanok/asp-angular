# ASP.NET Core + Angular

## Tech Stack

- **Frontend:** Angular 21, AG Grid, SignalR, JsBarcode
- **Backend:** ASP.NET Core 10, Entity Framework Core, SignalR
- **Database:** PostgreSQL

## Quick Start

### Option 1: Docker 
```bash
docker compose up --build
```

Access at http://localhost

To stop:
```bash
docker compose down
```

### Option 2: Manual Setup

#### Prerequisites

- Node.js 22+
- .NET 10 SDK
- PostgreSQL 14+

#### 1. Database

```bash
createdb tccbev
```

#### 2. Backend

```bash
cd backend
dotnet run
```

Runs at http://localhost:5000

#### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Runs at http://localhost:4200

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/item/search` | Search items |
| POST | `/api/item` | Create item |
| GET | `/api/item/{id}` | Get item |
| DELETE | `/api/item/{id}` | Delete item |

Swagger UI: http://localhost:5000/swagger

## Testing

### Frontend
```bash
cd frontend
npm test                 # Run tests in watch mode
npm run test:ci          # Run tests headless (CI)
npm run test:coverage    # Run tests with coverage report
```

### Backend
```bash
dotnet test backend.Tests
```
