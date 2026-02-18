"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does AI app building work?",
      answer: "Simply describe your app idea in plain English. Our AI understands your requirements and generates the complete app code, including UI, functionality, and backend integration."
    },
    {
      question: "Can I customize the generated code?",
      answer: "Yes! You have full access to the generated code. You can modify, extend, or completely redesign any part of your app using our visual editor or by editing the code directly."
    },
    {
      question: "What types of apps can I build?",
      answer: "You can build virtually any type of mobile app - from social networks and e-commerce stores to productivity tools and games. Our AI supports complex features like user authentication, payments, real-time chat, and more."
    },
    {
      question: "How long does it take to build an app?",
      answer: "Most apps are generated in under 2 minutes! However, the time can vary based on complexity. Simple apps take seconds, while complex apps with multiple features might take a few minutes."
    },
    {
      question: "Do I need coding knowledge?",
      answer: "Not at all! AppForge is designed for everyone. Just describe what you want in natural language. However, if you do know how to code, you'll have full control over the generated codebase."
    },
    {
      question: "Can I publish my app to app stores?",
      answer: "Absolutely! We handle the entire publishing process for you, including generating store listings, screenshots, and managing submissions to Google Play Store and Apple App Store."
    },
    {
      question: "What about app monetization?",
      answer: "We support multiple monetization strategies including AdMob integration, in-app purchases, subscriptions, and premium features. Our Pro plan includes built-in revenue optimization tools."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Our Free plan lets you build up to 3 apps with 20 AI prompts per day. No credit card required. Upgrade anytime to unlock more features and unlimited builds."
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-muted">
            Everything you need to know about AppForge
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <button
                  className="w-full text-left p-6 flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? "auto" : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-muted">
                    {faq.answer}
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}