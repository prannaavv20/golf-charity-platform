import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-white font-bold text-xl tracking-tight flex items-center gap-1">
          ⛳ <span className="text-emerald-400">GolfGives</span>
          {profile?.role === "admin" && (
            <span className="text-xs text-yellow-400 font-semibold ml-1">admin</span>
          )}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/charities" className="text-gray-400 hover:text-white transition">Charities</Link>
          {!user ? (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition">Login</Link>
              <Link to="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-semibold transition">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
              {profile?.role === "admin" && (
                <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 transition">Admin</Link>
              )}
              <button onClick={handleSignOut} className="text-gray-400 hover:text-red-400 transition">
                Sign Out
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm border-t border-gray-800 pt-4">
          <Link to="/charities" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white transition py-2">
            Charities
          </Link>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white transition py-2">
                Login
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-semibold transition text-center">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white transition py-2">
                Dashboard
              </Link>
              {profile?.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-yellow-400 hover:text-yellow-300 transition py-2">
                  Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="text-left text-red-400 hover:text-red-300 transition py-2">
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}