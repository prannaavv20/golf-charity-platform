import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharities() {
      const { data } = await supabase
        .from("charities")
        .select("*")
        .order("is_featured", { ascending: false });
      setCharities(data || []);
      setLoading(false);
    }
    fetchCharities();
  }, []);

  const featured = charities.find(c => c.is_featured);
  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">Our Charities</h1>
        <p className="text-gray-400 mb-10">Choose a cause your subscription will support each month.</p>

        {/* Featured Spotlight */}
        {featured && (
          <div className="mb-12 relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-gray-900 p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl flex-shrink-0">
                ⭐
              </div>
              <div className="flex-1">
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">
                  Featured This Month
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 mb-2">{featured.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">{featured.description}</p>
              </div>
              <Link
                to={`/charities/${featured.id}`}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition whitespace-nowrap flex-shrink-0"
              >
                View Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">No charities found matching "{search}"</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(charity => (
              <div
                key={charity.id}
                className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200"
              >
                {charity.is_featured && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 mb-3 inline-block">
                    ⭐ Featured
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg mb-4 group-hover:bg-emerald-500/10 transition">
                  ❤️
                </div>
                <h3 className="text-lg font-bold mb-2">{charity.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{charity.description}</p>
                <Link
                  to={`/charities/${charity.id}`}
                  className="mt-4 inline-block text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  View Profile →
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}