# Dynamic Flow API Documentation

REST API สำหรับ Dynamic Flow platform ที่ใช้ JSON file storage

## 🚀 Getting Started

### Start Development Server
```bash
# Start both API and frontend
npm run dev

# Or start individually
npm run api      # API only (port 3001)
npm run builder  # Frontend only (port 3000)
```

### Base URL
```
http://localhost:3001/api
```

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0",
  "storage": "JSON file-based"
}
```

## 📝 Flows API

### Get All Flows
```http
GET /api/flows
```

Query Parameters:
- `status` (optional): `draft` | `published` | `archived`
- `search` (optional): Search in title and description
- `limit` (optional): Number of results per page (default: 50)
- `page` (optional): Page number (default: 1)

Response:
```json
{
  "flows": [
    {
      "id": "uuid",
      "title": "Contact Form",
      "description": "Simple contact form",
      "nodes": [...],
      "settings": {...},
      "theme": {...},
      "status": "published",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z",
      "publishedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "pages": 1
  }
}
```

### Get Single Flow
```http
GET /api/flows/:id
```

Response: Single flow object

### Create Flow
```http
POST /api/flows
Content-Type: application/json

{
  "title": "New Form",
  "description": "Form description",
  "nodes": [...],
  "settings": {
    "allowMultipleSubmissions": false,
    "showProgressBar": true,
    "requireAuth": false,
    "collectAnalytics": true
  },
  "theme": {...},
  "status": "draft"
}
```

### Update Flow
```http
PUT /api/flows/:id
Content-Type: application/json

{
  "title": "Updated Form",
  ...
}
```

### Delete Flow
```http
DELETE /api/flows/:id
```

### Publish Flow
```http
POST /api/flows/:id/publish
```

### Unpublish Flow
```http
POST /api/flows/:id/unpublish
```

### Duplicate Flow
```http
POST /api/flows/:id/duplicate
```

### Get Flow Analytics
```http
GET /api/flows/:id/analytics
```

Response:
```json
{
  "flowId": "uuid",
  "views": 150,
  "submissions": 23,
  "conversionRate": "15.33"
}
```

## 📊 Responses API

### Get All Responses
```http
GET /api/responses
```

Query Parameters:
- `flowId` (optional): Filter by specific flow
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `limit` (optional): Results per page (default: 50)
- `page` (optional): Page number (default: 1)
- `sortBy` (optional): Sort field (default: submittedAt)
- `sortOrder` (optional): `asc` | `desc` (default: desc)

### Get Single Response
```http
GET /api/responses/:id
```

### Submit Form Response
```http
POST /api/responses
Content-Type: application/json

{
  "flowId": "uuid",
  "responses": [
    {
      "nodeId": "node_1",
      "questionId": "first_name",
      "value": "John",
      "type": "text_input"
    },
    {
      "nodeId": "node_2", 
      "questionId": "email",
      "value": "john@example.com",
      "type": "email_input"
    }
  ],
  "metadata": {
    "completionTime": 45,
    "deviceType": "desktop",
    "startedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

Response:
```json
{
  "id": "response-uuid",
  "message": "Response submitted successfully",
  "submittedAt": "2024-01-20T10:05:00.000Z"
}
```

### Export Responses
```http
GET /api/responses/flow/:flowId/export?format=json
GET /api/responses/flow/:flowId/export?format=csv
```

### Get Response Analytics
```http
GET /api/responses/flow/:flowId/analytics
```

Response:
```json
{
  "flowId": "uuid",
  "totalResponses": 23,
  "averageCompletionTime": 67,
  "responsesByDate": {
    "2024-01-20": 5,
    "2024-01-21": 8,
    "2024-01-22": 10
  },
  "deviceStats": {
    "desktop": 15,
    "tablet": 3,
    "mobile": 5
  },
  "questionStats": {
    "first_name": {
      "completed": 23,
      "skipped": 0
    },
    "phone": {
      "completed": 18,
      "skipped": 5
    }
  }
}
```

## 💾 Data Storage

### File Structure
```
apps/api/data/
├── flows.json          # All flows
├── responses.json      # All form responses
└── analytics.json      # Analytics data
```

### JSON File Format

**flows.json**
```json
[
  {
    "id": "uuid",
    "title": "Form Title",
    "description": "Description",
    "nodes": [...],
    "settings": {...},
    "theme": {...},
    "status": "published",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "publishedAt": "ISO date"
  }
]
```

**responses.json**
```json
[
  {
    "id": "uuid",
    "flowId": "flow-uuid",
    "responses": [...],
    "metadata": {...},
    "submittedAt": "ISO date"
  }
]
```

**analytics.json**
```json
{
  "totalViews": 1250,
  "totalSubmissions": 234,
  "flows": {
    "flow-uuid": {
      "views": 150,
      "submissions": 23
    }
  }
}
```

## 🔌 Frontend Integration

### API Client Usage
```typescript
import { flowsApi, responsesApi } from './services/api';

// Get all flows
const { flows } = await flowsApi.getAll();

// Create new flow
const newFlow = await flowsApi.create({
  title: 'New Form',
  nodes: [...],
  settings: {...}
});

// Submit response
await responsesApi.submit({
  flowId: 'uuid',
  responses: [...],
  metadata: {...}
});
```

### Environment Variables
```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Migration to PostgreSQL

เมื่อพร้อมจะเปลี่ยนไปใช้ PostgreSQL:

1. **Install Dependencies**
```bash
npm install pg @types/pg knex
```

2. **Create Database Schema**
```sql
-- flows table
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  theme JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- responses table  
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. **Update Storage Layer**
```typescript
// Replace JsonStorage with PostgreSQL queries
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

4. **Migration Strategy**
- Export existing JSON data
- Import to PostgreSQL tables
- Update API endpoints
- Test thoroughly
- Deploy with zero downtime

## 🔒 Security Considerations

- Input validation with Joi
- Rate limiting (implement with express-rate-limit)
- CORS configuration
- File upload limits
- SQL injection prevention (when using PostgreSQL)
- Data backup strategies

## 📈 Performance Optimization

- File-based: Use file watching for real-time updates
- Database: Connection pooling, indexing, query optimization
- Caching: Redis for frequently accessed data
- CDN: Static assets delivery
