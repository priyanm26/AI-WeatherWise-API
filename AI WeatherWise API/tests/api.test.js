const request = require('supertest');
const mongoose = require('mongoose');

// Mock Mongoose models and database connection
jest.mock('../config/database', () => jest.fn().mockResolvedValue(true));

const app = require('../index');
const User = require('../models/User');
const Location = require('../models/Location');
const generateToken = require('../utils/generateToken');

describe('AI WeatherWise API Test Suite', () => {

  let readerToken;
  let adminToken;
  const mockReaderId = new mongoose.Types.ObjectId().toString();
  const mockAdminId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    jest.setTimeout(15000);
    readerToken = generateToken(mockReaderId, 'reader');
    adminToken = generateToken(mockAdminId, 'admin');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('AI WeatherWise');
    });
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user successfully', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: mockReaderId,
        name: 'Alex Reader',
        email: 'alex@example.com',
        role: 'reader',
        createdAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alex Reader',
          email: 'alex@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBeDefined();
    });

    it('should login user successfully', async () => {
      const mockUserInstance = {
        _id: mockReaderId,
        name: 'Alex Reader',
        email: 'alex@example.com',
        role: 'reader',
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      const selectMock = jest.fn().mockResolvedValue(mockUserInstance);
      jest.spyOn(User, 'findOne').mockReturnValue({ select: selectMock });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject invalid password login', async () => {
      const mockUserInstance = {
        _id: mockReaderId,
        name: 'Alex Reader',
        email: 'alex@example.com',
        role: 'reader',
        isActive: true,
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      const selectMock = jest.fn().mockResolvedValue(mockUserInstance);
      jest.spyOn(User, 'findOne').mockReturnValue({ select: selectMock });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alex@example.com',
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Favorite Location CRUD (Protected Routes)', () => {
    beforeEach(() => {
      // Mock User.findById for authMiddleware
      const mockUserInstance = {
        _id: mockReaderId,
        name: 'Alex Reader',
        email: 'alex@example.com',
        role: 'reader',
        isActive: true,
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserInstance),
      });
    });

    it('should create a favorite location', async () => {
      const mockLocationId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(Location, 'create').mockResolvedValue({
        _id: mockLocationId,
        user: mockReaderId,
        city: 'Chennai',
        country: 'India',
        notes: 'Hometown',
      });

      const res = await request(app)
        .post('/api/locations')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          city: 'Chennai',
          country: 'India',
          notes: 'Hometown',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city).toBe('Chennai');
    });

    it('should list user favorite locations', async () => {
      const mockLocations = [
        { _id: new mongoose.Types.ObjectId(), city: 'Chennai', country: 'India' },
        { _id: new mongoose.Types.ObjectId(), city: 'London', country: 'UK' },
      ];
      jest.spyOn(Location, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockLocations),
      });

      const res = await request(app)
        .get('/api/locations')
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should reject request without Bearer token', async () => {
      const res = await request(app)
        .get('/api/locations');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Weather & AI Endpoints', () => {
    it('should fetch weather for a city', async () => {
      const res = await request(app).get('/api/weather/Chennai');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city).toBe('Chennai');
    });

    it('should fetch weather + combined AI insights', async () => {
      const res = await request(app).get('/api/weather/Chennai/insights');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weather.city).toBe('Chennai');
      expect(res.body.data.ai.summary).toBeDefined();
    });

    it('should generate AI weather summary', async () => {
      const res = await request(app)
        .post('/api/ai/summary')
        .send({ city: 'Tokyo' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
    });

    it('should generate AI recommendations', async () => {
      const res = await request(app)
        .post('/api/ai/recommendation')
        .send({ city: 'London' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(Array.isArray(res.body.data.clothing)).toBe(true);
      expect(Array.isArray(res.body.data.advice)).toBe(true);
    });
  });

  describe('Role-Based Authorization & Admin Controls', () => {
    it('should deny non-admin user access to admin routes with 403 Forbidden', async () => {
      const mockReaderUser = {
        _id: mockReaderId,
        name: 'Alex Reader',
        email: 'alex@example.com',
        role: 'reader',
        isActive: true,
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockReaderUser),
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Administrative role required');
    });

    it('should allow admin user access to admin user list', async () => {
      const mockAdminUser = {
        _id: mockAdminId,
        name: 'System Admin',
        email: 'admin@weatherwise.com',
        role: 'admin',
        isActive: true,
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdminUser),
      });

      const mockUsersList = [
        { _id: mockAdminId, name: 'System Admin', role: 'admin' },
        { _id: mockReaderId, name: 'Alex Reader', role: 'reader' },
      ];

      const sortMock = jest.fn().mockResolvedValue(mockUsersList);
      const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
      jest.spyOn(User, 'find').mockReturnValue({ select: selectMock });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });
  });

});
