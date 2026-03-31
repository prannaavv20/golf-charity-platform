import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabase";

export default function CharityDetail() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharity() {
      const { data } = await supabase
        .from("charities")
        .select("*")
        .eq("id", id)
        .single();
      setCharity(data);
      setLoading(false);
    }
    fetchCharity();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!charity) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-center px-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Charity not found</h2>
        <Link to="/charities" className="text-emerald-400 hover:text-emerald-300">← Back to Charities</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/charities" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mb-8 transition">
          ← Back to Charities
        </Link>

        {/* Header card */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-900 mb-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-8">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl flex-shrink-0">
                ❤️
              </div>
              <div className="flex-1">
                {charity.is_featured && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 mb-3 inline-block">
                    ⭐ Featured This Month
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white mb-3">{charity.name}</h1>
                <p className="text-gray-400 leading-relaxed">{charity.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Members Supporting", value: "847+" },
            { label: "Raised This Month", value: "£12,480" },
            { label: "Avg. Contribution", value: "£4.20" },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">🗓️ Upcoming Events</h2>
          <div className="space-y-3">
            {[
              { name: "Annual Charity Golf Day", date: "15 May 2026", location: "Surrey Golf Club" },
              { name: "Junior Golf Camp", date: "22 June 2026", location: "Edinburgh Links" },
              { name: "Fundraiser Tournament", date: "10 July 2026", location: "Manchester GC" },
            ].map(event => (
              <div key={event.name} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <div>
                  <div className="text-white text-sm font-medium">{event.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{event.location}</div>
                </div>
                <span className="text-emerald-400 text-xs font-semibold whitespace-nowrap ml-4">{event.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Support {charity.name}</h3>
          <p className="text-gray-400 text-sm mb-6">Subscribe to GolfGives and choose this charity to receive a portion of your subscription every month.</p>
          <Link
            to="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition inline-block"
          >
            Start Supporting →
          </Link>
        </div>

      </div>
    </div>
  );
}