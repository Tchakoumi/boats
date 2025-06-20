import './test-framework.js';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Boat Creation and Management API Tests', () => {
  // Test data
  const validBoat = {
    name: 'Ocean Explorer',
    type: 'Sailboat',
    year: 2020
  };

  // Clean up database before and after tests
  beforeAll(async () => {
    try {
      await prisma.boat.deleteMany({});
    } catch (error) {
      console.log('Warning: Could not clean database before tests');
    }
  });

  afterAll(async () => {
    try {
      await prisma.boat.deleteMany({});
      await prisma.$disconnect();
    } catch (error) {
      console.log('Warning: Could not clean up after tests');
    }
  });

  beforeEach(async () => {
    try {
      await prisma.boat.deleteMany({});
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('POST /boats - Boat Creation', () => {
    it('should successfully create a boat with valid data', async () => {
      const response = await request(app)
        .post('/boats')
        .send(validBoat);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(validBoat.name);
      expect(response.body.type).toBe(validBoat.type);
      expect(response.body.year).toBe(validBoat.year);
    });

    it('should reject boat creation without name', async () => {
      const invalidBoat = { type: 'Sailboat', year: 2020 };
      const response = await request(app)
        .post('/boats')
        .send(invalidBoat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should reject boat creation without type', async () => {
      const invalidBoat = { name: 'Test Boat', year: 2020 };
      const response = await request(app)
        .post('/boats')
        .send(invalidBoat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Type is required and must be a non-empty string');
    });

    it('should reject boat creation without year', async () => {
      const invalidBoat = { name: 'Test Boat', type: 'Sailboat' };
      const response = await request(app)
        .post('/boats')
        .send(invalidBoat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should reject boat creation with invalid year (too old)', async () => {
      const invalidBoat = { name: 'Test Boat', type: 'Sailboat', year: 1799 };
      const response = await request(app)
        .post('/boats')
        .send(invalidBoat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should reject boat creation with invalid year (too far in future)', async () => {
      const currentYear = new Date().getFullYear();
      const invalidBoat = { name: 'Test Boat', type: 'Sailboat', year: currentYear + 11 };
      const response = await request(app)
        .post('/boats')
        .send(invalidBoat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should accept year as string if convertible to valid integer', async () => {
      const boatWithStringYear = { ...validBoat, year: '2020' };
      const response = await request(app)
        .post('/boats')
        .send(boatWithStringYear);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(2020);
    });

    it('should accept edge case years (1800 and current year + 10)', async () => {
      const currentYear = new Date().getFullYear();

      // Test minimum valid year
      const minYearBoat = { ...validBoat, name: 'Old Boat', year: 1800 };
      const minResponse = await request(app)
        .post('/boats')
        .send(minYearBoat);

      expect(minResponse.status).toBe(201);
      expect(minResponse.body.year).toBe(1800);

      // Test maximum valid year
      const maxYearBoat = { ...validBoat, name: 'Future Boat', year: currentYear + 10 };
      const maxResponse = await request(app)
        .post('/boats')
        .send(maxYearBoat);

      expect(maxResponse.status).toBe(201);
      expect(maxResponse.body.year).toBe(currentYear + 10);
    });
  });

  describe('GET /boats - Retrieve Boats', () => {
    it('should return empty array when no boats exist', async () => {
      const response = await request(app).get('/boats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return created boats', async () => {
      // Create test boats
      const boat1 = { ...validBoat, name: 'Boat 1' };
      const boat2 = { ...validBoat, name: 'Boat 2' };

      await request(app).post('/boats').send(boat1);
      await request(app).post('/boats').send(boat2);

      const response = await request(app).get('/boats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('year');
    });
  });

  describe('PUT /boats/:id - Update Boats', () => {
    it('should update boat with valid changes', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;
      const updateData = { name: 'Updated Boat Name' };

      const updateResponse = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Boat Name');
      expect(updateResponse.body.type).toBe(validBoat.type);
      expect(updateResponse.body.year).toBe(validBoat.year);
    });

    it('should return 404 for non-existent boat', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/boats/${fakeId}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bateau non trouvé');
    });
  });

  describe('DELETE /boats/:id - Delete Boats', () => {
    it('should delete existing boat', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/boats/${boatId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify boat is deleted
      const getResponse = await request(app).get('/boats');
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent boat', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/boats/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bateau non trouvé');
    });
  });

  describe('GET /boats/search - Search Boats', () => {
    it('should handle search requests without errors', async () => {
      const response = await request(app)
        .get('/boats/search');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with query parameters', async () => {
      const response = await request(app)
        .get('/boats/search?type=Sailboat&year=2020');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});