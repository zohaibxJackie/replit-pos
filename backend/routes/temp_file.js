import fetch from "node-fetch"; // if using Node 18+, fetch is built-in

const login = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "rb7910076@gmail.com",
        password: "admin123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Token:", data.token || data.accessToken);
  } catch (err) {
    console.error("Login failed:", err);
  }
};

login();
