async function testHealth() {
  const res = await fetch('http://localhost:5000/api/health');
  const data = await res.json();
  console.log('HEALTH RESPONSE:', data);
}
testHealth();
