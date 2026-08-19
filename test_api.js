const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'thabee@kalpanaafinance.com',
      password: 'admin'
    });
    const token = loginRes.data.token;
    console.log("Logged in. Token:", token.substring(0, 10) + "...");
    
    const loansRes = await axios.get('http://localhost:8080/api/admin/loans', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Loans length:", loansRes.data.length);
    console.log("First loan:", loansRes.data[0]);
  } catch (e) {
    console.error("Error:", e.response ? (e.response.status + " " + JSON.stringify(e.response.data)) : e.message);
  }
}

test();
