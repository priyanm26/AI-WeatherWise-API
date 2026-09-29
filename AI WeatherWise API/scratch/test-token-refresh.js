async function testFreshToken() {
  const baseUrl = 'http://localhost:5000';

  console.log('1. Logging in to get fresh token...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priyan@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Response Token:', loginData.token);

  console.log('\n2. Fetching locations with fresh token...');
  const locRes = await fetch(`${baseUrl}/api/locations`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const locData = await locRes.json();
  console.log('Locations Response:', locData);
}

testFreshToken();
