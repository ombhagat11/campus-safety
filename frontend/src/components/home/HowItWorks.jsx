const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Create your account with your campus email and unique campus code",
      icon: "✍️",
      color: "from-sky-500 to-blue-500"
    },
    {
      number: "2",
      title: "Report Incidents",
      description: "Spot something concerning? Report it with location, photos, and details",
      icon: "📱",
      color: "from-indigo-500 to-purple-500"
    },
    {
      number: "3",
      title: "Stay Informed",
      description: "View reports on the map, get alerts, and stay aware of your surroundings",
      icon: "👀",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "4",
      title: "Build Community",
      description: "Vote, comment, and help verify information to keep everyone safe",
      icon: "🤝",
      color: "from-pink-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to make your campus safer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-1 bg-gradient-to-r from-sky-200 to-indigo-200 dark:from-sky-800 dark:to-indigo-800 transform translate-x-8 -z-10"></div>
              )}

              <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                {/* Number Badge */}
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;