export const login = async (email, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    // Store token in localStorage (or sessionStorage)
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Login failed:", error.message);
    return { success: false, error: error.message };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const register = async (fullName, email, password) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token); // Store token for authentication
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.message || "Signup failed" };
    }
  } catch (err) {
    return { success: false, error: "Something went wrong. Please try again later." };
  }
};
