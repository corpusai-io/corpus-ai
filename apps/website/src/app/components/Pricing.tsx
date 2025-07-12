'use client';
import { useState } from "react";

export default function PricingPage() {
  const [billingType, setBillingType] = useState("monthly");

  const monthlyPlans = [
    {
      title: "Free",
      price: "$0",
      desc: "Good for getting started",
      features: [
        "1 Corpus Bot",
        "20 queries",
        "1 Corpus Bot",
        "Max 100 docs or 50MB",
      ],
    },
    {
      title: "Starter",
      price: "$29",
      desc: "Suite for personal",
      features: [
        "2 Corpus Bot",
        "1500 queries",
        "Maximum of 100 docs/webpages or 50M doc storage per DenserBot",
        "REST Api",
        "30 days query log retention",
      ],
    },
    {
      title: "Standard",
      price: "$119",
      desc: "Good for small team.",
      features: [
        "4 Corpus Bot",
        "7500 queries",
        "Maximum of 2000 docs/webpages or 1G doc storage per DenserBot",
        "REST Api",
        "30 days query log retention",
        "Remove \"powered by Corpus.ai\" label",
      ],
      mostPopular: true,
    },
    {
      title: "Business",
      price: "$399",
      desc: "Perfect for businesses.",
      features: [
        "8 DenserBots",
        "15000 queries",
        "Maximum of 10000 docs/webpages or 5G doc storage per Corpus Bot",
        "REST Api",
        "365 days query log retention",
        "Remove \"powered by Corpus.ai\" label",
        "Dedicated accuracy support",
      ],
    },
  ];

  const yearlyPlans = [
    {
      title: "Free",
      price: "$0",
      desc: "Good for getting started",
      features: monthlyPlans[0].features,
    },
    {
      title: "Starter",
      price: "$24",
      desc: "Suite for personal",
      features: monthlyPlans[1].features,
    },
    {
      title: "Standard",
      price: "$96",
      desc: "Good for small team ",
      features: monthlyPlans[2].features,
      mostPopular: true,
    },
    {
      title: "Business",
      price: "$320",
      desc: "Perfect for businesses",
      features: monthlyPlans[3].features,
    },
  ];

  const plans = billingType === "monthly" ? monthlyPlans : yearlyPlans;
   return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-center mb-12">
        <div className="relative w-72 h-16 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-between px-2">
          <div
            onClick={() => setBillingType("monthly")}
            className={`w-32 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              billingType === "monthly"
                ? "bg-purple-500 text-white"
                : "bg-white text-[#1E1E1E]"
            }`}
          >
            <span className="font-semibold">Monthly</span>
          </div>
          <div
            onClick={() => setBillingType("yearly")}
            className={`w-32 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              billingType === "yearly"
                ? "bg-purple-500 text-white"
                : "bg-white text-[#1E1E1E]"
            }`}
          >
            <span className="font-semibold">Yearly</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`bg-white ${
              plan.mostPopular ? "border-2 border-purple-500 shadow-lg relative" : "border border-gray-200 shadow-sm"
            } rounded-xl p-6`}
          >
            {plan.mostPopular && (
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-[#DFC9FF] to-[#BF56FF] px-4 py-1 rounded-full text-white text-sm font-medium flex items-center gap-1">
                <img src="/Achievements/fire-fill 1.svg" alt="fire" />
                Most Popular
              </div>
            )}
            <h3 className="text-lg font-semibold text-[#454545] mb-2">{plan.title}</h3>
            <p className="text-3xl font-bold text-[#1E1E1E] mb-2">{plan.price}<span className="text-xs text-[#858585] font-medium ml-1">/mo</span></p>
            <p className="text-[#858585] mb-4">{plan.desc}</p>

            <button
              className={`w-full py-2 mb-6 ${
                plan.mostPopular
                  ? "bg-purple-500 text-white rounded-lg font-medium shadow-md"
                  : "border border-gray-300 rounded-lg text-gray-800 font-medium"
              }`}
            >
              Get Started
            </button>

            <ul className="space-y-3 text-left">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-900 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4">Enterprise Plan</h3>
            <p className="text-gray-300 mb-6 md:mb-0">
              Need a custom solution? Let&rsquo;s work together to create the perfect package for your organization.
            </p>
          </div>
          <div>
            <button className="w-full md:w-[182px] h-[54px] bg-gradient-to-r from-[#FC5990] to-[#AC5DE6] px-6 py-3 rounded-full font-medium transition hover:opacity-90">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

