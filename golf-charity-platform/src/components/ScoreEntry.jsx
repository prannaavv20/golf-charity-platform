import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

export default function ScoreEntry() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false });
    setScores(data || []);
  }

  async function handleAddScore(e) {
    e.preventDefault();
    setMessage("");
    const scoreNum = parseInt(score);
    if (scoreNum < 1 || scoreNum > 45) {
      setMessage("Score must be between 1 and 45.");
      return;
    }

    setLoading(true);

    // If already 5 scores, delete the oldest one first
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1];
      await supabase.from("scores").delete().eq("id", oldest.id);
    }

    const { error } = await supabase.from("scores").insert({
      user_id: user.id,
      score: scoreNum,
      played_on: date,
    });

    if (error) setMessage("Error saving score. Try again.");
    else {
      setMessage("Score added!");
      setScore("");
      setDate("");
      fetchScores();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from("scores").delete().eq("id", id);
    fetchScores();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-1">My Scores</h2>
      <p className="text-gray-400 text-sm mb-6">Enter your last 5 Stableford scores (1–45). Latest score replaces oldest when full.</p>

      <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="number"
          placeholder="Score (1-45)"
          value={score}
          onChange={e => setScore(e.target.value)}
          min={1} max={45} required
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition w-full sm:w-36"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition w-full sm:w-44"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Saving..." : "Add Score"}
        </button>
      </form>

      {message && (
        <p className={`text-sm mb-4 ${message.includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      )}

      {scores.length === 0 ? (
        <p className="text-gray-500 text-sm">No scores yet. Add your first score above.</p>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-6">#{i + 1}</span>
                <span className="text-2xl font-bold text-emerald-400">{s.score}</span>
                <span className="text-gray-400 text-sm">pts</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">{new Date(s.played_on).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-600 hover:text-red-400 transition text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}