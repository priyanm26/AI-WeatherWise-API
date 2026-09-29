async function testEndpoints() {
  const baseUrl = 'http://localhost:5000';

  console.log('\n1. Testing GET /api/health');
  let res = await fetch(`${baseUrl}/api/health`);
  let data = await res.json();
  console.log('Health Response:', data);

  console.log('\n2. Testing POST /api/auth/register');
  res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: `user_${Date.now()}@example.com`, password: 'password123' })
  });
  data = await res.json();
  console.log('Register Response:', data);

  console.log('\n3. Testing POST /api/auth/login (Regular User)');
  res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priyan@example.com', password: 'password123' })
  });
  data = await res.json();
  console.log('Login User Response:', data);
  const userToken = data.token;

  console.log('\n4. Testing POST /api/auth/login (Admin User)');
  res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priyan@weatherwise.com', password: 'priyan262007@!' })
  });
  data = await res.json();
  console.log('Login Admin Response:', data);
  const adminToken = data.token;

  console.log('\n5. Testing POST /api/locations (Protected)');
  res = await fetch(`${baseUrl}/api/locations`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ city: 'Chennai', country: 'India', notes: 'Hometown' })
  });
  data = await res.json();
  console.log('Create Location Response:', data);

  console.log('\n6. Testing GET /api/locations (Protected)');
  res = await fetch(`${baseUrl}/api/locations`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  data = await res.json();
  console.log('Get Locations Response:', data);

  console.log('\n7. Testing GET /api/weather/Chennai/insights');
  res = await fetch(`${baseUrl}/api/weather/Chennai/insights`);
  data = await res.json();
  console.log('Weather Insights Response:', JSON.stringify(data, null, 2));

  console.log('\n8. Testing GET /api/admin/users (Admin Protected)');
  res = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  data = await res.json();
  console.log('Admin Users Response:', data);
}

testEndpoints();
