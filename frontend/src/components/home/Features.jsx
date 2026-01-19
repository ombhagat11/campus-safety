const Features = () => {
  const features = [
    {
      icon: "📍",
      title: "Real-Time Reporting",
      description: "Report incidents instantly with precise location tracking and photo evidence. Help keep your community informed.",
      color: "from-blue-500 to-sky-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      icon: "🗺️",
      title: "Interactive Maps",
      description: "View all reported incidents on an interactive map. Stay aware of what's happening around you in real-time.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      icon: "🔔",
      title: "Instant Alerts",
      description: "Get notified immediately about incidents near you. Never miss important safety information.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      icon: "👥",
      title: "Community Driven",
      description: "Vote and comment on reports to verify information. Work together to maintain accurate safety data.",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      icon: "🛡️",
      title: "Anonymous Reporting",
      description: "Report incidents anonymously if needed. Your identity is protected while keeping others safe.",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    },
    {
      icon: "⚡",
      title: "Fast Response",
      description: "Moderators review and verify reports quickly. Campus security can respond to incidents faster.",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need for Campus Safety
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Powerful features designed to keep your campus community safe and informed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-xl ${feature.bgColor} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;