# Sailing Location API

A RESTful API for managing boats with MongoDB and Elasticsearch integration.

## API Endpoints

### Health Check
- `GET /` - General application health check
- `GET /elasticsearch/health` - Elasticsearch specific health check

### Boats
- `GET /boats` - Get all boats
- `POST /boats` - Create a new boat
- `PUT /boats/:id` - Update a boat by ID
- `DELETE /boats/:id` - Delete a boat by ID
- `GET /boats/search` - Search boats with query and filters

## Request/Response Examples

### Create Boat
```http
POST /boats
Content-Type: application/json

{
  "name": "Sea Breeze",
  "type": "Sailboat",
  "year": 2020
}
```

### Search Boats
```http
GET /boats/search?q=sea&type=sailboat&yearMin=2000&yearMax=2023
```

## Error Responses

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error