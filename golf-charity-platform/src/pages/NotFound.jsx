import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-7xl mb-6">⛳</div>
        <h1 className="text-4xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-gray-400 mb-8">Looks like this shot went out of bounds.</p>
        <Link to="/" className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}