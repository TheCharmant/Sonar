import { useState } from "react";
import { getAuthUrl } from "../utils/api";
import { v4 as uuid } from "uuid";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const uid = uuid(); // temporary unique session
    const url = await getAuthUrl(uid);
    window.location.href = url;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>
    </div>
  );
};

export default Login;