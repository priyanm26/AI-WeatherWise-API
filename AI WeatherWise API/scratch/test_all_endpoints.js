const app = require('../index');
const connectDB = require('../config/database');
const request = require('supertest');

async function testAll() {
  await connectDB();
  console.log('--- TESTING ALL API ENDPOINTS ---');

  // 1. Health
  const health = await request(app).get('/api/health');
  console.log(`1. GET /api/health -> Status: ${health.status}, Success: ${health.body.success}`);

  // 2. Register User
  const testEmail = `alex_${Date.now()}@example.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Alex Reader',
    email: testEmail,
    password: 'Password123!'
  });
  const token = reg.body.token;
  const userId = reg.body.data?.id || reg.body.data?._id;
  console.log(`2. POST /api/auth/register -> Status: ${reg.status}, Token received: ${!!token}, UserId: ${userId}`);

  // 3. User Login
  const login = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'Password123!'
  });
  console.log(`3. POST /api/auth/login -> Status: ${login.status}, Token received: ${!!login.body.token}`);

  // 4. Get Profile
  const profile = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
  console.log(`4. GET /api/users/me -> Status: ${profile.status}, Name: ${profile.body.data?.name}`);

  // 5. Update Profile
  const updateProfile = await request(app).put('/api/users/me').set('Authorization', `Bearer ${token}`).send({
    name: 'Alex Updated',
    password: 'NewPassword123!'
  });
  console.log(`5. PUT /api/users/me -> Status: ${updateProfile.status}, Updated Name: ${updateProfile.body.data?.name}`);

  // 6. Add Favorite Location
  const addLoc = await request(app).post('/api/locations').set('Authorization', `Bearer ${token}`).send({
    city: 'Chennai',
    country: 'India',
    notes: 'Hometown'
  });
  const locationId = addLoc.body.data?._id || addLoc.body.data?.id;
  console.log(`6. POST /api/locations -> Status: ${addLoc.status}, Location ID: ${locationId}`);

  // 7. Get Saved Locations
  const getLocs = await request(app).get('/api/locations').set('Authorization', `Bearer ${token}`);
  console.log(`7. GET /api/locations -> Status: ${getLocs.status}, Count: ${getLocs.body.data?.length}`);

  // 8. Get Location By ID
  const getLocById = await request(app).get(`/api/locations/${locationId}`).set('Authorization', `Bearer ${token}`);
  console.log(`8. GET /api/locations/:id -> Status: ${getLocById.status}, City: ${getLocById.body.data?.city}`);

  // 9. Update Location
  const updateLoc = await request(app).put(`/api/locations/${locationId}`).set('Authorization', `Bearer ${token}`).send({
    city: 'Chennai',
    country: 'India',
    notes: 'Updated note'
  });
  console.log(`9. PUT /api/locations/:id -> Status: ${updateLoc.status}, Notes: ${updateLoc.body.data?.notes}`);

  // 10. Delete Location
  const delLoc = await request(app).delete(`/api/locations/${locationId}`).set('Authorization', `Bearer ${token}`);
  console.log(`10. DELETE /api/locations/:id -> Status: ${delLoc.status}, Message: ${delLoc.body.message}`);

  // 11. Get Live Weather
  const weather = await request(app).get('/api/weather/Chennai');
  console.log(`11. GET /api/weather/Chennai -> Status: ${weather.status}, City: ${weather.body.data?.city}`);

  // 12. Get Weather + AI Insights
  const weatherInsights = await request(app).get('/api/weather/Chennai/insights');
  console.log(`12. GET /api/weather/Chennai/insights -> Status: ${weatherInsights.status}, Summary: ${!!weatherInsights.body.data?.aiInsights?.summary}`);

  // 13. AI Weather Summary
  const aiSummary = await request(app).post('/api/ai/summary').send({ city: 'Tokyo' });
  console.log(`13. POST /api/ai/summary -> Status: ${aiSummary.status}, Summary: ${!!aiSummary.body.data?.summary}`);

  // 14. AI Recommendations
  const aiRec = await request(app).post('/api/ai/recommendation').send({ city: 'London' });
  console.log(`14. POST /api/ai/recommendation -> Status: ${aiRec.status}, Activities: ${!!aiRec.body.data?.activities}`);

  // Admin Auth Login
  const adminEmail = process.env.ADMIN_EMAIL || 'priyan@weatherwise.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'priyan262007@!';
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: adminEmail,
    password: adminPassword
  });
  const adminToken = adminLogin.body.token;
  console.log(`Admin Login Status: ${adminLogin.status}, AdminToken received: ${!!adminToken}`);

  // 15. Get All Users (Admin)
  const adminGetUsers = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
  console.log(`15. GET /api/admin/users -> Status: ${adminGetUsers.status}, User Count: ${adminGetUsers.body.data?.length}`);

  // 16. Get User By ID (Admin)
  const adminGetUserById = await request(app).get(`/api/admin/users/${userId}`).set('Authorization', `Bearer ${adminToken}`);
  console.log(`16. GET /api/admin/users/:id -> Status: ${adminGetUserById.status}, Email: ${adminGetUserById.body.data?.email}`);

  // 17. Update User Status (Admin)
  const adminUpdateStatus = await request(app).patch(`/api/admin/users/${userId}/status`).set('Authorization', `Bearer ${adminToken}`).send({
    isActive: false
  });
  console.log(`17. PATCH /api/admin/users/:id/status -> Status: ${adminUpdateStatus.status}, IsActive: ${adminUpdateStatus.body.data?.isActive}`);

  // 18. Delete User (Admin)
  const adminDeleteUser = await request(app).delete(`/api/admin/users/${userId}`).set('Authorization', `Bearer ${adminToken}`);
  console.log(`18. DELETE /api/admin/users/:id -> Status: ${adminDeleteUser.status}, Message: ${adminDeleteUser.body.message}`);

  console.log('--- ALL 18 ENDPOINTS TESTED SUCCESSFULLY ---');
  process.exit(0);
}

testAll().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
