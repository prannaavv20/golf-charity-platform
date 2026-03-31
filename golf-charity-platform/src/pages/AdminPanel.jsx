import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Charity form
  const [charityName, setCharityName] = useState("");
  const [charityDesc, setCharityDesc] = useState("");
  const [charityFeatured, setCharityFeatured] = useState(false);

  // Draw state
  const [simulatedNumbers, setSimulatedNumbers] = useState([]);

  // Score editing
  const [editingScores, setEditingScores] = useState(null);
  const [userScoresList, setUserScoresList] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchCharities();
    fetchDraws();
    fetchWinners();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  }

  async function fetchCharities() {
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });
    setCharities(data || []);
  }

  async function fetchDraws() {
    const { data } = await supabase
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false });
    setDraws(data || []);
  }

  async function fetchWinners() {
    const { data } = await supabase
      .from("winners")
      .select("*, profiles(full_name, email), draws(draw_date)")
      .order("created_at", { ascending: false });
    setWinners(data || []);
  }

  // ── USER MANAGEMENT ──────────────────────────────────────────

  async function handleToggleSubscription(userId, currentStatus) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await supabase.from("profiles").update({ subscription_status: newStatus }).eq("id", userId);
    fetchUsers();
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await supabase.from("profiles").delete().eq("id", userId);
    fetchUsers();
  }

  async function handleViewScores(user) {
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("played_on", { ascending: false });
    setUserScoresList(data || []);
    setEditingScores(user);
  }

  async function handleDeleteScore(scoreId) {
    await supabase.from("scores").delete().eq("id", scoreId);
    handleViewScores(editingScores);
  }

  // ── CHARITY MANAGEMENT ───────────────────────────────────────

  async function handleAddCharity(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("charities").insert({
      name: charityName,
      description: charityDesc,
      is_featured: charityFeatured,
    });
    if (error) setMessage("Error adding charity.");
    else {
      setMessage("Charity added!");
      setCharityName("");
      setCharityDesc("");
      setCharityFeatured(false);
      fetchCharities();
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleDeleteCharity(id) {
    if (!window.confirm("Delete this charity?")) return;
    await supabase.from("charities").delete().eq("id", id);
    fetchCharities();
  }

  async function handleToggleFeatured(id, current) {
    await supabase.from("charities").update({ is_featured: !current }).eq("id", id);
    fetchCharities();
  }

  // ── DRAW ENGINE ──────────────────────────────────────────────

  function simulateDraw() {
    const numbers = [];
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }
    setSimulatedNumbers(numbers.sort((a, b) => a - b));
  }

  async function publishDraw() {
    if (simulatedNumbers.length !== 5) {
      setMessage("Simulate a draw first.");
      return;
    }
    setLoading(true);

    // Check for jackpot rollover from last draw
    const { data: lastDraw } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const activeUsers = users.filter(u => u.subscription_status === "active").length;
    const totalPool = activeUsers * 9.99;
    let jackpot = parseFloat((totalPool * 0.40).toFixed(2));

    if (lastDraw) {
      const { data: lastWinners } = await supabase
        .from("winners")
        .select("*")
        .eq("draw_id", lastDraw.id)
        .eq("match_type", "5-match");
      if (!lastWinners || lastWinners.length === 0) {
        jackpot = parseFloat((jackpot + Number(lastDraw.jackpot_amount)).toFixed(2));
      }
    }

    const pool4 = parseFloat((totalPool * 0.35).toFixed(2));
    const pool3 = parseFloat((totalPool * 0.25).toFixed(2));

    const { data: draw, error } = await supabase.from("draws").insert({
      draw_date: new Date().toISOString().split("T")[0],
      winning_numbers: simulatedNumbers,
      status: "published",
      jackpot_amount: jackpot,
      pool_4match: pool4,
      pool_3match: pool3,
    }).select().single();

    if (error) {
      setMessage("Error publishing draw.");
      setLoading(false);
      return;
    }

    const { data: allScores } = await supabase.from("scores").select("user_id, score");
    const userScores = {};
    allScores?.forEach(s => {
      if (!userScores[s.user_id]) userScores[s.user_id] = [];
      userScores[s.user_id].push(s.score);
    });

    for (const [userId, scores] of Object.entries(userScores)) {
      const matches = scores.filter(s => simulatedNumbers.includes(s)).length;
      if (matches >= 3) {
        const matchType = matches === 5 ? "5-match" : matches === 4 ? "4-match" : "3-match";
        const prize = matches === 5 ? jackpot : matches === 4 ? pool4 : pool3;
        await supabase.from("winners").insert({
          draw_id: draw.id,
          user_id: userId,
          match_type: matchType,
          prize_amount: prize,
          payment_status: "pending",
        });
      }
    }

    setMessage(`✅ Draw published! Winning numbers: ${simulatedNumbers.join(", ")} | Jackpot: £${jackpot}`);
    setSimulatedNumbers([]);
    fetchDraws();
    fetchWinners();
    setLoading(false);
    setTimeout(() => setMessage(""), 6000);
  }

  // ── WINNERS MANAGEMENT ───────────────────────────────────────

  async function handleMarkPaid(winnerId) {
    await supabase.from("winners").update({ payment_status: "paid" }).eq("id", winnerId);
    fetchWinners();
  }

  async function handleRejectWinner(winnerId) {
    await supabase.from("winners").update({ payment_status: "rejected" }).eq("id", winnerId);
    fetchWinners();
  }

  // ── COMPUTED STATS ───────────────────────────────────────────

  const activeCount = users.filter(u => u.subscription_status === "active").length;
  const totalPool = parseFloat((activeCount * 9.99).toFixed(2));
  const totalContributions = users
    .filter(u => u.subscription_status === "active")
    .reduce((sum, u) => sum + (9.99 * (u.charity_percentage || 10) / 100), 0);

  const tabs = [
    { id: "users", label: "👥 Users" },
    { id: "charities", label: "❤️ Charities" },
    { id: "draws", label: "🎰 Draw Engine" },
    { id: "winners", label: "🏆 Winners" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage users, charities, draws, and winners</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length },
            { label: "Active Subscribers", value: activeCount },
            { label: "Charities", value: charities.length },
            { label: "Total Prize Pool", value: `£${totalPool}` },
            { label: "Charity Contributions", value: `£${totalContributions.toFixed(2)}` },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <>
            {/* Score editing modal */}
            {editingScores && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Scores — {editingScores.full_name}</h3>
                    <button onClick={() => setEditingScores(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                  </div>
                  {userScoresList.length === 0 ? (
                    <p className="text-gray-500 text-sm">No scores recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {userScoresList.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold text-xl">{s.score}</span>
                            <span className="text-gray-400 text-sm">{new Date(s.played_on).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteScore(s.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-left">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Subscription</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-white">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-700 text-gray-300"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.subscription_status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {u.subscription_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{u.subscription_plan || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewScores(u)}
                              className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg transition"
                            >
                              View Scores
                            </button>
                            <button
                              onClick={() => handleToggleSubscription(u.id, u.subscription_status)}
                              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition"
                            >
                              Toggle Sub
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── CHARITIES TAB ── */}
        {activeTab === "charities" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Add New Charity</h2>
              <form onSubmit={handleAddCharity} className="space-y-4">
                <input
                  type="text"
                  placeholder="Charity name"
                  value={charityName}
                  onChange={e => setCharityName(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
                <textarea
                  placeholder="Description"
                  value={charityDesc}
                  onChange={e => setCharityDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={charityFeatured}
                    onChange={e => setCharityFeatured(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <label htmlFor="featured" className="text-gray-400 text-sm">Mark as featured</label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Charity"}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{c.description}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(c.id, c.is_featured)}
                          className={`text-xs px-2 py-0.5 rounded-full transition ${c.is_featured ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-700 text-gray-400"}`}
                        >
                          {c.is_featured ? "⭐ Featured" : "Not Featured"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteCharity(c.id)}
                          className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DRAW ENGINE TAB ── */}
        {activeTab === "draws" && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-2">Monthly Draw Engine</h2>
              <p className="text-gray-400 text-sm mb-6">Simulate first, review numbers, then publish officially.</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button onClick={simulateDraw} className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-lg transition">
                  🎲 Simulate Draw
                </button>
                <button
                  onClick={publishDraw}
                  disabled={loading || simulatedNumbers.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "✅ Publish Draw"}
                </button>
              </div>

              {simulatedNumbers.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">Simulated winning numbers:</p>
                  <div className="flex gap-3">
                    {simulatedNumbers.map(n => (
                      <div key={n} className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-3">Prize pool — {activeCount} active subscribers</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Jackpot (40%)", value: (activeCount * 9.99 * 0.40).toFixed(2) },
                    { label: "4-Match (35%)", value: (activeCount * 9.99 * 0.35).toFixed(2) },
                    { label: "3-Match (25%)", value: (activeCount * 9.99 * 0.25).toFixed(2) },
                  ].map(p => (
                    <div key={p.label} className="text-center">
                      <div className="text-emerald-400 font-bold">£{p.value}</div>
                      <div className="text-gray-500 text-xs">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {draws.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-bold">Past Draws</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-left">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Winning Numbers</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Jackpot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draws.map(d => (
                      <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-white">{new Date(d.draw_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {d.winning_numbers?.map(n => (
                              <span key={n} className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">{n}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{d.status}</span>
                        </td>
                        <td className="px-4 py-3 text-emerald-400">£{d.jackpot_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── WINNERS TAB ── */}
        {activeTab === "winners" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {winners.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No winners yet. Run a draw first.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Draw Date</th>
                    <th className="px-4 py-3">Match</th>
                    <th className="px-4 py-3">Prize</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map(w => (
                    <tr key={w.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3">
                        <div className="text-white">{w.profiles?.full_name || "—"}</div>
                        <div className="text-gray-500 text-xs">{w.profiles?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          w.match_type === "5-match" ? "bg-yellow-500/10 text-yellow-400" :
                          w.match_type === "4-match" ? "bg-blue-500/10 text-blue-400" :
                          "bg-purple-500/10 text-purple-400"
                        }`}>
                          {w.match_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-bold">£{w.prize_amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          w.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" :
                          w.payment_status === "rejected" ? "bg-red-500/10 text-red-400" :
                          "bg-orange-500/10 text-orange-400"
                        }`}>
                          {w.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {w.payment_status === "pending" && (
                            <>
                              <button
                                onClick={() => handleMarkPaid(w.id)}
                                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg transition"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleRejectWinner(w.id)}
                                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {w.payment_status === "paid" && <span className="text-xs text-emerald-400">✓ Verified</span>}
                          {w.payment_status === "rejected" && <span className="text-xs text-red-400">✗ Rejected</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}