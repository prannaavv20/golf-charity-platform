import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ── Intersection observer hook ─────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Featured Charity Card ──────────────────────────────────────────────────
function FeaturedCharity() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="px-6 py-24 bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Spotlight Charity
          </span>
          <h2 className="text-3xl font-bold text-white mt-3 mb-10">
            This month we're backing
          </h2>
        </div>

        <div className={`transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-gray-900">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            <div className="flex flex-col md:flex-row gap-0">
              {/* Left — visual */}
              <div className="md:w-2/5 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 p-10 flex flex-col justify-between min-h-[260px]">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mb-6">
                    🌿
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    Golf Foundation<br />
                    <span className="text-emerald-400">Youth Programme</span>
                  </h3>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    Bringing golf to underserved communities — funding equipment, coaching, and access for young players across the UK.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["bg-emerald-500","bg-teal-500","bg-cyan-500","bg-green-500"].map((c,i) => (
                      <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-gray-900`} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">847 members supporting this</span>
                </div>
              </div>

              {/* Right — stats + CTA */}
              <div className="md:w-3/5 p-10 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Raised this month", value: "£12,480", sub: "+18% vs last month" },
                    { label: "Young players helped", value: "340+", sub: "across 12 clubs" },
                    { label: "Avg. contribution", value: "£4.20", sub: "per subscriber" },
                    { label: "Events this year", value: "9", sub: "golf days & camps" },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                      <div className="text-xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                      <div className="text-xs text-emerald-400 mt-1">{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Monthly target</span>
                    <span className="text-emerald-400 font-semibold">83% reached</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                      style={{ width: inView ? "83%" : "0%" }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-2">£2,120 more to hit this month's target of £14,600</p>
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/charities"
                    className="flex-1 text-center bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
                  >
                    Support this charity →
                  </Link>
                  <Link
                    to="/charities"
                    className="px-5 py-3 rounded-xl text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    Browse all
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Impact Stats ───────────────────────────────────────────────────────────
function ImpactStats() {
  const [ref, inView] = useInView();
  const members = useCounter(2400, 1800, inView);
  const donated = useCounter(148000, 2000, inView);
  const charities = useCounter(24, 1200, inView);

  return (
    <section ref={ref} className="px-6 py-20 bg-gray-900 border-y border-gray-800">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-10">
          The impact so far
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: members.toLocaleString(), suffix: "+", label: "Active members", color: "text-emerald-400" },
            { value: "£" + (donated / 1000).toFixed(donated >= 1000 ? 1 : 0) + "k", suffix: "", label: "Donated to charity", color: "text-teal-400" },
            { value: charities, suffix: "", label: "Charities supported", color: "text-cyan-400" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`text-5xl font-extrabold ${s.color} tabular-nums`}>
                {s.value}{s.suffix}
              </div>
              <div className="text-gray-400 text-sm mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────
function HowItWorks() {
  const [ref, inView] = useInView();
  const steps = [
    {
      icon: "⬡",
      emoji: "🏌️",
      title: "Subscribe",
      desc: "Choose a monthly or yearly plan. A portion of every subscription flows directly to charity — automatically, every month.",
      accent: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/20",
    },
    {
      icon: "⬡",
      emoji: "📊",
      title: "Enter Your Scores",
      desc: "Log your last 5 Stableford scores. They're not just stats — they become your draw numbers each month.",
      accent: "from-teal-500/20 to-teal-600/5",
      border: "border-teal-500/20",
    },
    {
      icon: "⬡",
      emoji: "🏆",
      title: "Win & Give",
      desc: "Match numbers in the monthly draw to win prize pool money. Your chosen charity gets funded whether you win or not.",
      accent: "from-cyan-500/20 to-cyan-600/5",
      border: "border-cyan-500/20",
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Simple by design
          </span>
          <h2 className="text-3xl font-bold text-white mt-3">How it works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`group relative rounded-2xl border ${step.border} bg-gradient-to-b ${step.accent} p-7 transition-all duration-700 hover:-translate-y-1 hover:border-opacity-40`}
              style={{ transitionDelay: inView ? `${i * 120}ms` : "0ms", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)" }}
            >
              <div className="text-3xl mb-5">{step.emoji}</div>
              <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">
                Step {i + 1}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Prize Pool ─────────────────────────────────────────────────────────────
function PrizePool() {
  const [ref, inView] = useInView();
  const tiers = [
    { match: "5-Number Match", share: "40%", label: "Jackpot", rollover: true, bar: "w-[40%]", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { match: "4-Number Match", share: "35%", label: "Major Prize", rollover: false, bar: "w-[35%]", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { match: "3-Number Match", share: "25%", label: "Prize", rollover: false, bar: "w-[25%]", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            Every month
          </span>
          <h2 className="text-3xl font-bold text-white mt-3">Monthly prize pool</h2>
          <p className="text-gray-400 text-sm mt-3">A fixed share of every subscription automatically funds the prize pool.</p>
        </div>

        <div className="space-y-4">
          {tiers.map((tier, i) => (
            <div
              key={tier.match}
              className={`rounded-2xl border ${tier.bg} p-6 transition-all duration-700`}
              style={{ transitionDelay: inView ? `${i * 100}ms` : "0ms", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-white font-semibold">{tier.label}</span>
                  <span className="text-gray-500 text-sm ml-2">{tier.match}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tier.rollover && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                      Rolls over
                    </span>
                  )}
                  <span className={`text-2xl font-extrabold ${tier.color}`}>{tier.share}</span>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-current ${tier.color} transition-all duration-1000`}
                  style={{ width: inView ? tier.share : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonial / Social proof ─────────────────────────────────────────────
function SocialProof() {
  const [ref, inView] = useInView();
  const quotes = [
    { name: "James H.", loc: "Surrey", quote: "I've been golfing for 20 years and never felt like my hobby actually meant something. This changed that." },
    { name: "Sarah M.", loc: "Edinburgh", quote: "Won the 4-match prize last month. The charity contribution was the part I talked about most." },
    { name: "David K.", loc: "Manchester", quote: "Simple to use, and knowing my subscription goes somewhere real makes it easy to justify." },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-3xl font-bold text-white">Members speak</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q, i) => (
            <div
              key={q.name}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-700 hover:border-gray-700"
              style={{ transitionDelay: inView ? `${i * 100}ms` : "0ms", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-emerald-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{q.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {q.name[0]}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{q.name}</div>
                  <div className="text-gray-500 text-xs">{q.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative px-6 py-28 md:py-36 text-center overflow-hidden bg-gray-950">
      {/* Subtle radial glow behind headline */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div className="w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full bg-emerald-400/10"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            top: `${15 + i * 12}%`,
            left: `${8 + i * 14}%`,
            animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-14px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.1s; opacity: 0; }
        .anim-2 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.25s; opacity: 0; }
        .anim-3 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.4s; opacity: 0; }
        .anim-4 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.55s; opacity: 0; }
        .anim-5 { animation: fadeUp 0.6s ease forwards; animation-delay: 0.7s; opacity: 0; }
      `}</style>

      <div className="relative max-w-4xl mx-auto">
        <div className="anim-1">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Golf · Charity · Rewards
          </span>
        </div>

        <h1 className="anim-2 text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-6">
          Your game.<br />
          <span className="text-emerald-400">Real impact.</span>
        </h1>

        <p className="anim-3 text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-4 leading-relaxed">
          Every score you enter puts you in the monthly prize draw — while automatically funding a charity you believe in.
        </p>

        {/* Charity-first callout */}
        <div className="anim-4 inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-400 mb-10">
          <span className="text-emerald-400">🌿</span>
          <span>10% of every subscription goes directly to charity — no exceptions</span>
        </div>

        <div className="anim-5 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="group bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:-translate-y-0.5"
          >
            Start Your Membership
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
          <Link
            to="/charities"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            Browse Charities
          </Link>
        </div>

        {/* Trust signals */}
        <div className="anim-5 flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-500">
          {["Cancel anytime", "PCI-compliant payments", "No hidden fees", "Charity verified"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────
function FinalCTA() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} className="px-6 py-28 bg-gray-950">
      <div className={`max-w-2xl mx-auto text-center transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-8 py-10">
          <div className="text-4xl mb-4">⛳</div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Make your game count
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Join thousands of golfers playing with purpose — competing for prizes while funding causes that matter.
          </p>
          <Link
            to="/signup"
            className="group bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
          >
            Join GolfGives Today
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <p className="text-gray-500 text-xs mt-4">Monthly from £9.99 · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      <Hero />
      <ImpactStats />
      <FeaturedCharity />
      <HowItWorks />
      <PrizePool />
      <SocialProof />
      <FinalCTA />
    </div>
  );
}