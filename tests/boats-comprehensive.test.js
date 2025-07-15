import './test-framework.js';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Comprehensive Boat API Tests', () => {
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
    whitespaceName: {
      name: '   ',
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

  describe('POST /boats - Comprehensive Creation Tests', () => {
    it('should create a boat with valid data', async () => {
      const response = await request(app)
        .post('/boats')
        .send(validBoat);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(validBoat.name);
      expect(response.body.type).toBe(validBoat.type);
      expect(response.body.year).toBe(validBoat.year);
    });

    it('should create a boat with edge case valid year (1800)', async () => {
      const edgeCaseBoat = { ...validBoat, name: 'Ancient Vessel', year: 1800 };
      const response = await request(app)
        .post('/boats')
        .send(edgeCaseBoat);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(1800);
    });

    it('should create a boat with edge case valid year (current year + 10)', async () => {
      const futureYear = new Date().getFullYear() + 10;
      const edgeCaseBoat = { ...validBoat, name: 'Future Boat', year: futureYear };
      const response = await request(app)
        .post('/boats')
        .send(edgeCaseBoat);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(futureYear);
    });

    it('should fail to create boat without name', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingName);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with empty name', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.emptyName);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat with whitespace-only name', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.whitespaceName);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required and must be a non-empty string');
    });

    it('should fail to create boat without type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingType);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Type is required and must be a non-empty string');
    });

    it('should fail to create boat with empty type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.emptyType);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Type is required and must be a non-empty string');
    });

    it('should fail to create boat with invalid type', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidType);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid enum value');
    });

    it('should fail to create boat without year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.missingYear);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with year too old (before 1800)', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearTooOld);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with year too far in future', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearTooNew);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with non-numeric year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearString);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should fail to create boat with float year', async () => {
      const response = await request(app)
        .post('/boats')
        .send(invalidBoats.invalidYearFloat);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year is required and must be a valid year');
    });

    it('should accept year as string if it can be converted to valid integer', async () => {
      const boatWithStringYear = { ...validBoat, name: 'String Year Boat', year: '2020' };
      const response = await request(app)
        .post('/boats')
        .send(boatWithStringYear);

      expect(response.status).toBe(201);
      expect(response.body.year).toBe(2020);
    });

    it('should create multiple boats with different names and unique IDs', async () => {
      const boat1 = { ...validBoat, name: 'Boat One' };
      const boat2 = { ...validBoat, name: 'Boat Two' };

      const response1 = await request(app)
        .post('/boats')
        .send(boat1);

      const response2 = await request(app)
        .post('/boats')
        .send(boat2);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.name).toBe('Boat One');
      expect(response2.body.name).toBe('Boat Two');
      expect(response1.body.id).not.toBe(response2.body.id);
    });

    it('should handle different boat types', async () => {
      const boatTypes = ['Sailboat', 'Motorboat', 'Yacht', 'FishingBoat', 'Speedboat'];

      for (let i = 0; i < boatTypes.length; i++) {
        const boat = { ...validBoat, name: `${boatTypes[i]} Test`, type: boatTypes[i] };
        const response = await request(app)
          .post('/boats')
          .send(boat);

        expect(response.status).toBe(201);
        expect(response.body.type).toBe(boatTypes[i]);
      }
    });

    it('should handle different valid years across range', async () => {
      const testYears = [1800, 1900, 2000, 2020, new Date().getFullYear(), new Date().getFullYear() + 10];

      for (let i = 0; i < testYears.length; i++) {
        const boat = { ...validBoat, name: `Year ${testYears[i]} Boat`, year: testYears[i] };
        const response = await request(app)
          .post('/boats')
          .send(boat);

        expect(response.status).toBe(201);
        expect(response.body.year).toBe(testYears[i]);
      }
    });
  });

  describe('Advanced GET /boats Tests', () => {
    it('should return empty array when no boats exist', async () => {
      const response = await request(app).get('/boats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all boats with correct structure', async () => {
      // Create multiple test boats
      const boats = [
        { ...validBoat, name: 'Test Boat 1', type: 'Sailboat', year: 2020 },
        { ...validBoat, name: 'Test Boat 2', type: 'Motorboat', year: 2021 },
        { ...validBoat, name: 'Test Boat 3', type: 'Yacht', year: 2019 }
      ];

      for (const boat of boats) {
        await request(app).post('/boats').send(boat);
      }

      const response = await request(app).get('/boats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);

      // Check structure of each boat
      response.body.forEach(boat => {
        expect(boat).toHaveProperty('id');
        expect(boat).toHaveProperty('name');
        expect(boat).toHaveProperty('type');
        expect(boat).toHaveProperty('year');
        expect(typeof boat.id).toBe('string');
        expect(typeof boat.name).toBe('string');
        expect(typeof boat.type).toBe('string');
        expect(typeof boat.year).toBe('number');
      });
    });
  });

  describe('Advanced PUT /boats/:id Tests', () => {
    it('should update boat with valid partial data', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;

      // Test updating just the name
      const updateData = { name: 'Updated Ocean Explorer' };
      const updateResponse = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Ocean Explorer');
      expect(updateResponse.body.type).toBe(validBoat.type);
      expect(updateResponse.body.year).toBe(validBoat.year);
    });

    it('should update boat with multiple fields', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;

      // Update multiple fields
      const updateData = { name: 'New Name', type: 'Motorboat', year: 2022 };
      const updateResponse = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('New Name');
      expect(updateResponse.body.type).toBe('Motorboat');
      expect(updateResponse.body.year).toBe(2022);
    });

    it('should fail to update boat with invalid year', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;
      const updateData = { year: 1799 };

      const response = await request(app)
        .put(`/boats/${boatId}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Year must be a valid year');
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

  describe('Advanced DELETE /boats/:id Tests', () => {
    it('should delete existing boat and verify removal', async () => {
      // Create a boat first
      const createResponse = await request(app)
        .post('/boats')
        .send(validBoat);

      const boatId = createResponse.body.id;

      // Delete the boat
      const deleteResponse = await request(app)
        .delete(`/boats/${boatId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify boat is deleted by checking GET /boats
      const getResponse = await request(app).get('/boats');
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent boat deletion', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/boats/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Bateau non trouvé');
    });
  });

  describe('Advanced Search Tests', () => {
    beforeEach(async () => {
      // Create test boats for search
      const testBoats = [
        { name: 'Ocean Explorer', type: 'Sailboat', year: 2020 },
        { name: 'Sea Breeze', type: 'Motorboat', year: 2019 },
        { name: 'Wind Dancer', type: 'Sailboat', year: 2021 },
        { name: 'Speed Demon', type: 'Speedboat', year: 2022 },
        { name: 'Peaceful Waters', type: 'Yacht', year: 2018 }
      ];

      for (const boat of testBoats) {
        await request(app).post('/boats').send(boat);
      }

      // Give some time for potential Elasticsearch indexing
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should handle search without query parameters', async () => {
      const response = await request(app)
        .get('/boats/search');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with type filter', async () => {
      const response = await request(app)
        .get('/boats/search?type=Sailboat');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with year filter', async () => {
      const response = await request(app)
        .get('/boats/search?year=2020');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with year range filter', async () => {
      const response = await request(app)
        .get('/boats/search?yearMin=2019&yearMax=2021');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with query string', async () => {
      const response = await request(app)
        .get('/boats/search?q=Ocean');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle search with combined filters', async () => {
      const response = await request(app)
        .get('/boats/search?type=Sailboat&yearMin=2020&q=Wind');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});