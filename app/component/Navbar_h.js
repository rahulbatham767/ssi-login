import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState("User"); // Replace with actual user data

  const handleLogout = () => {
    // Perform logout logic
    console.log("User logged out");
    router.push("/login"); // Redirect to login page
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-200 shadow-md">
        <span className="text-lg font-semibold">{user}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow justify-center items-center">
        <h1 className="text-3xl font-bold">Welcome {user}</h1>
      </div>
    </div>
  );
}
