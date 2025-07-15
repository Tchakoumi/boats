import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Boat Endpoints', () => {
  // Test data
  const validBoat = {
    name: 'Ocean Explorer',
    type: 'Sailboat',
    year: 2020
  };

  const invalidBoats = {
    missingName: {
      type: 'Sailboat',
      year: 2020
    },
    emptyName: {
      name: '',
      type: 'Sailboat',
      year: 2020
    },
    missingType: {
      name: 'Ocean Explorer',
      year: 2020
    },
    emptyType: {
      name: 'Ocean Explorer',
      type: '',
      year: 2020
    },
    invalidType: {
      name: 'Ocean Explorer',
      type: 'InvalidBoatType',
      year: 2020
    },
    missingYear: {
      name: 'Ocean Explorer',
      type: 'Sailboat'
    },
    invalidYearTooOld: {
      name: 'Ocean Explorer',
      type: 'Sailboat',
      year: 1799
    },
    invalidYearTooNew: {
      name: 'Ocean Explorer',
      type: 'Sailboat',
      year: new Date().getFullYear() + 11
    },
    invalidYearString: {
      name: 'Ocean Explorer',
      type: 'Sailboat',
      year: 'not-a-year'
    },
    invalidYearFloat: {
      name: 'Ocean Explorer',
      type: 'Sailboat',
      year: 2020.5
    }
  };

  // Clean up database before each test
  beforeEach(async () => {
    try {
      await prisma.boat.deleteMany({});
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  // Clean up database after all tests
  afterAll(async () => {
    try {
      await prisma.boat.deleteMany({});
      await prisma.$disconnect();
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('POST /boats - Create Boat', () => {
    it('should create a boat with valid data', async () => {
      const response = await request(app)
        .post('/boats')
        .send(validBoat)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(validBoat.name);
      expect(response.body.type).toBe(validBoat.type);
      expect(response.body.year).toBe(validBoat.year);
    });

    it('should create a boat with edge case valid year (1800)', async () => {
      const edgeCaseBoat = { ...validBoat, year: 1800 };
      const response = await request(app)
        .post('/boats')
        .send(edgeCaseBoat)
        .expect(201);

      expect(response.body.year).toBe(1800);
    });

    it('should create a boat with edge case valid year (current year + 10)', async () => {
      const futureYear = new Date().getFullYear() + 10;
      const edgeCaseBoat = { ...validBoat, year: futureYear };
      const response = await request(app)
        .post('/boats')
        .send(edgeCaseBoat)
        .expect(201);

      expect(response.body.year).toBe(futureYear);
    });

    it('should fail to create boat without name', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingName)
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with empty name', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.emptyName)
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with whitespace-only name', async () => {
      const response = await request(app)
        .post('/boats')
        .send({ ...validBoat, name: '   ' })
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with tab-only name', async () => {
      const response = await request(app)
        .post('/boats')
        .send({ ...validBoat, name: '\t\t' })
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with newline-only name', async () => {
      const response = await request(app)
        .post('/boats')
        .send({ ...validBoat, name: '\n\n' })
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with mixed whitespace name', async () => {
      const response = await request(app)
        .post('/boats')
        .send({ ...validBoat, name: ' \t\n ' })
        .expect(400);

      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat without type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingType)
        .expect(400);

      expect(response.body.error).toBe('Type is required and must be a non-empty string');
    });

    it('should fail to create boat with empty type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.emptyType)
        .expect(400);

      expect(response.body.error).toBe('Type is required and must be a non-empty string');
    });

    it('should fail to create boat with invalid type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidType)
        .expect(400);

      expect(response.body.error).toContain('Invalid enum value');
    });

    it('should fail to create boat without year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingYear)
        .expect(400);

      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with year too old (before 1800)', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearTooOld)
        .expect(400);

      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with year too far in future', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearTooNew)
        .expect(400);

      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with non-numeric year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearString)
        .expect(400);

      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with float year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearFloat)
        .expect(400);

      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should handle invalid JSON payload', async () => {
      const response = await request(app)
        .post('/boats')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should accept year as string if it can be converted to valid integer', async () => {
      const boatWithStringYear = { ...validBoat, year: '2020' };
      const response = await request(app)
        .post('/boats')
        .send(boatWithStringYear)
        .expect(201);

      expect(response.body.year).toBe(2020);
    });

    it('should create multiple boats with different names', async () => {
      const boat1 = { ...validBoat, name: 'Boat One' };
      const boat2 = { ...validBoat, name: 'Boat Two' };

      const response1 = await request(app)
        .post('/boats')
        .send(boat1)
        .expect(201);

      const response2 = await request(app)
        .post('/boats')
        .send(boat2)
        .expect(201);

      expect(response1.body.name).toBe('Boat One');
      expect(response2.body.name).toBe('Boat Two');
      expect(response1.body.id).not.toBe(response2.body.id);
    });
  });

  describe('GET /boats - Get All Boats', () => {
    it('should return empty array when no boats exist', async () => {
      const response = await request(app)
        .get('/boats')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all boats when boats exist', async () => {
      // Create test boats first
      await request(app).post('/boats').send({ ...validBoat, name: 'Boat 1' });
      await request(app).post('/boats').send({ ...validBoat, name: 'Boat 2' });

      const response = await request(app)
        .get('/boats')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('year');
    });
  });

  describe('PUT /boats/:id - Update Boat', () => {
    let boatId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);
      boatId = createResponse.body.id;
    });

    it('should update boat with valid data', async () => {
      const updateData = { name: 'Updated Boat Name' };
      const response = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Boat Name');
      expect(response.body.type).toBe(validBoat.type);
      expect(response.body.year).toBe(validBoat.year);
    });

    it('should update boat with partial data', async () => {
      const updateData = { type: 'Motorboat' };
      const response = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.type).toBe('Motorboat');
      expect(response.body.name).toBe(validBoat.name);
    });

    it('should fail to update boat with invalid year', async () => {
      const updateData = { year: 1799 };
      const response = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Year must be a valid year');
    });

    it('should return 404 for non-existent boat', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/boats/${fakeId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.error).toBe('Bateau non trouvé');
    });
  });

  describe('DELETE /boats/:id - Delete Boat', () => {
    let boatId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);
      boatId = createResponse.body.id;
    });

    it('should delete existing boat', async () => {
      await request(app)
        .delete(`/boats/${boatId}`)
        .expect(204);

      // Verify boat is deleted
      const getResponse = await request(app)
        .get('/boats')
        .expect(200);

      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent boat', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/boats/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('Bateau non trouvé');
    });
  });

  describe('GET /boats/search - Search Boats', () => {
    beforeEach(async () => {
      // Create test boats for search
      await request(app).post('/boats').send({ name: 'Ocean Explorer', type: 'Sailboat', year: 2020 });
      await request(app).post('/boats').send({ name: 'Sea Breeze', type: 'Motorboat', year: 2019 });
      await request(app).post('/boats').send({ name: 'Wind Dancer', type: 'Sailboat', year: 2021 });

      // Give some time for Elasticsearch indexing (if enabled)
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should handle search without query parameters', async () => {
      const response = await request(app)
        .get('/boats/search')
        .expect(200);

      // Should return some results or empty array
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with type filter', async () => {
      const response = await request(app)
        .get('/boats/search?type=Sailboat')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with year filter', async () => {
      const response = await request(app)
        .get('/boats/search?year=2020')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with year range filter', async () => {
      const response = await request(app)
        .get('/boats/search?yearMin=2019&yearMax=2021')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with query string', async () => {
      const response = await request(app)
        .get('/boats/search?q=Ocean')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});