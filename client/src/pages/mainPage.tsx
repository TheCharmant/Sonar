import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to GC Hub</h1>
      <p className="text-lg mb-10">Choose your role to sign in:</p>

      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Sign in as Client
        </button>
        <button
          onClick={() => alert("Manager login not implemented yet")}
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Sign in as Manager
        </button>
        <button
          onClick={() => alert("Admin login not implemented yet")}
          className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Sign in as Admin
        </button>
      </div>
    </div>
  );
};

export default MainPage;
