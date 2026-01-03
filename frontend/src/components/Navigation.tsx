import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine if a tab is active
  const isActive = (path: string) => location.pathname === path;

  return (
    // Container: Fixed to bottom, full width, dark background with blur
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#121212] border-t border-gray-800 pb-safe-bottom">
      <div className="flex justify-around items-center h-20 px-2">
        {/* --- HOME TAB --- */}
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            isActive("/")
              ? "text-yellow-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {/* Icon */}
          <div
            className={`p-1 rounded-xl ${isActive("/") ? "bg-yellow-400/10" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isActive("/") ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isActive("/") ? "0" : "2"}
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </div>
          {/* Label */}
          <span className="text-xs font-medium mt-1">Tap</span>
        </button>

        {/* --- TASKS TAB --- */}
        <button
          onClick={() => navigate("/tasks")}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            isActive("/tasks")
              ? "text-yellow-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <div
            className={`p-1 rounded-xl ${isActive("/tasks") ? "bg-yellow-400/10" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isActive("/tasks") ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isActive("/tasks") ? "0" : "2"}
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium mt-1">Tasks</span>
        </button>

        {/* --- FRIENDS TAB --- */}
        <button
          onClick={() => navigate("/friends")}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            isActive("/friends")
              ? "text-yellow-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <div
            className={`p-1 rounded-xl ${isActive("/friends") ? "bg-yellow-400/10" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isActive("/friends") ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isActive("/friends") ? "0" : "2"}
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium mt-1">Friends</span>
        </button>
      </div>
    </nav>
  );
};
