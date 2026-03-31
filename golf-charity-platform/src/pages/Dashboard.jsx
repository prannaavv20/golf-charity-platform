import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import ScoreEntry from "../components/ScoreEntry";

export default function Dashboard() {
  const { user, profile, fetchProfile } = useAuth();
  const [charities, setCharities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCharity, setSelectedCharity] = useState("");
  const [charityPct, setCharityPct] = useState(10);
  const [subscribed, setSubscribed] = useState(false);
  const [myWinnings, setMyWinnings] = useState([]);
  const [upcomingDraw, setUpcomingDraw] = useState(null);

  useEffect(() => {
    fetchCharities();
    if (user) {
      fetchWinnings();
      fetchUpcomingDraw();
    }
    if (profile) {
      setSelectedCharity(profile.charity_id || "");
      setCharityPct(profile.charity_percentage || 10);
      setSubscribed(profile.subscription_status === "active");
    }
  }, [profile, user]);

  async function fetchCharities() {
    const { data } = await supabase.from("charities").select("*").order("name");
    setCharities(data || []);
  }

  async function fetchWinnings() {
    const { data } = await supabase
      .from("winners")
      .select("*, draws(draw_date, winning_numbers)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMyWinnings(data || []);
  }

  async function fetchUpcomingDraw() {
    const { data } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setUpcomingDraw(data || null);
  }

  async function handleSaveCharity(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ charity_id: selectedCharity, charity_percentage: charityPct })
      .eq("id", user.id);
    if (error) setMessage("Error saving. Try again.");
    else {
      setMessage("Saved successfully!");
      fetchProfile(user.id);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleMockSubscribe(plan) {
    setSaving(true);
    const today = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + (plan === "yearly" ? 12 : 1));
    await supabase.from("profiles").update({
      subscription_status: "active",
      subscription_plan: plan,
      subscription_start: today.toISOString().split("T")[0],
      subscription_end: end.toISOString().split("T")[0],
    }).eq("id", user.id);
    setSubscribed(true);
    fetchProfile(user.id);
    setSaving(false);
  }

  async function handleCancelSubscription() {
    await supabase.from("profiles").update({
      subscription_status: "inactive",
      subscription_plan: null,
    }).eq("id", user.id);
    setSubscribed(false);
    fetchProfile(user.id);
  }

  const totalWon = myWinnings.reduce((sum, w) => sum + Number(w.prize_amount), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0] || "Golfer"} 👋</h1>
          <p className="text-gray-400 mt-1 text-sm">Here's your GolfGives dashboard</p>
        </div>

        {/* Subscription Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>
          {subscribed ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Active — {profile?.subscription_plan === "yearly" ? "Yearly" : "Monthly"} Plan
                </span>
                <p className="text-gray-400 text-sm mt-2">
                  Renews: {profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString() : "—"}
                </p>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="text-sm text-red-400 hover:text-red-300 border border-red-400/20 px-4 py-2 rounded-lg transition"
              >
                Cancel Subscription
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-4">Choose a plan to join the monthly prize draw and support your charity.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                  <div className="text-lg font-bold mb-1">Monthly</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mb-1">£9.99<span className="text-base font-normal text-gray-400">/mo</span></div>
                  <p className="text-gray-400 text-sm mb-4">Billed monthly. Cancel anytime.</p>
                  <button
                    onClick={() => handleMockSubscribe("monthly")}
                    disabled={saving}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Subscribe Monthly
                  </button>
                </div>
                <div className="bg-gray-800 border border-emerald-500/30 rounded-xl p-5 relative">
                  <span className="absolute top-3 right-3 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Best Value</span>
                  <div className="text-lg font-bold mb-1">Yearly</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mb-1">£99.99<span className="text-base font-normal text-gray-400">/yr</span></div>
                  <p className="text-gray-400 text-sm mb-4">Save 2 months vs monthly.</p>
                  <button
                    onClick={() => handleMockSubscribe("yearly")}
                    disabled={saving}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Subscribe Yearly
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Score Entry */}
        <ScoreEntry />

        {/* Charity Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-1">My Charity</h2>
          <p className="text-gray-400 text-sm mb-6">Choose which charity receives a portion of your subscription.</p>
          <form onSubmit={handleSaveCharity} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Select Charity</label>
              <select
                value={selectedCharity}
                onChange={e => setSelectedCharity(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="">— Choose a charity —</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                Contribution: <span className="text-emerald-400 font-bold">{charityPct}%</span>
              </label>
              <input
                type="range"
                min={10} max={50} step={5}
                value={charityPct}
                onChange={e => setCharityPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10% (min)</span><span>50% (max)</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Charity Preference"}
            </button>
            {message && <p className="text-emerald-400 text-sm">{message}</p>}
          </form>
        </div>

        {/* Participation Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Participation Summary</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Subscription", value: subscribed ? "Active" : "Inactive", color: subscribed ? "text-emerald-400" : "text-red-400" },
              { label: "Plan", value: profile?.subscription_plan ? (profile.subscription_plan === "yearly" ? "Yearly" : "Monthly") : "None", color: "text-white" },
              { label: "Charity %", value: `${charityPct}%`, color: "text-emerald-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Draw Info */}
          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">🎰 Latest Draw</h3>
            {upcomingDraw ? (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-400 text-sm">
                  {new Date(upcomingDraw.draw_date).toLocaleDateString()} —
                </span>
                <div className="flex gap-1">
                  {upcomingDraw.winning_numbers?.map(n => (
                    <span key={n} className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">{n}</span>
                  ))}
                </div>
                <span className="text-gray-500 text-xs ml-2">Jackpot: £{upcomingDraw.jackpot_amount}</span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No draws run yet. Check back soon!</p>
            )}
          </div>
        </div>

        {/* Winnings Overview */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">🏆 My Winnings</h2>
          {myWinnings.length === 0 ? (
            <p className="text-gray-500 text-sm">No winnings yet. Enter your scores and join the next draw!</p>
          ) : (
            <div className="space-y-3">
              {myWinnings.map(w => (
                <div key={w.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.match_type === "5-match" ? "bg-yellow-500/10 text-yellow-400" :
                      w.match_type === "4-match" ? "bg-blue-500/10 text-blue-400" :
                      "bg-purple-500/10 text-purple-400"
                    }`}>
                      {w.match_type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold">£{w.prize_amount}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" :
                      w.payment_status === "rejected" ? "bg-red-500/10 text-red-400" :
                      "bg-orange-500/10 text-orange-400"
                    }`}>
                      {w.payment_status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between">
                <span className="text-gray-400 text-sm font-semibold">Total Won</span>
                <span className="text-emerald-400 font-bold text-lg">£{totalWon.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}