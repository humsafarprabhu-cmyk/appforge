"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  ArrowRight, 
  Code2,
  Sparkles,
  ChevronDown,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";
import { isIndianUser, formatPrice, getCheckoutUrl } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/config/plans";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export function PricingClient() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricingFaqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated amount immediately. When you downgrade, the change takes effect at your next billing cycle."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you reach your plan's limits, you'll receive notifications to upgrade. Your existing apps will continue to work, but you won't be able to create new apps or generate more AI prompts until you upgrade or your limits reset."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with AppForge, contact our support team within 30 days of purchase for a full refund."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for annual plans, we also accept bank transfers and company purchase orders."
    },
    {
      question: "Is there a free trial?",
      answer: "Our Free plan is essentially a permanent free trial! You can build up to 3 apps and use 20 AI prompts per day forever. No time limits, no credit card required."
    },
    {
      question: "Can I use my own Firebase/AdMob accounts?",
      answer: "Absolutely! On Maker plan and above, you can connect your own Firebase project and AdMob account for full control over your app's backend and monetization."
    },
    {
      question: "What's included in Play Store submission?",
      answer: "We handle the entire submission process: generating app icons, screenshots, store descriptions, managing certificates, uploading builds, and monitoring review status. You just need to provide your Google Play developer account."
    },
    {
      question: "Do you provide technical support?",
      answer: "Yes! Free users get community support. Paid plans get email support with response times: Maker (48h), Pro (24h), Agency (2h). Pro and Agency also get priority chat support."
    }
  ];

  const comparisonFeatures = [
    {
      category: "App Building",
      features: [
        {
          name: "Apps included",
          free: "3",
          maker: "10", 
          pro: "Unlimited",
          agency: "Unlimited"
        },
        {
          name: "AI prompts per day",
          free: "20",
          maker: "100",
          pro: "Unlimited", 
          agency: "Unlimited"
        },
        {
          name: "Code export",
          free: false,
          maker: true,
          pro: true,
          agency: true
        },
        {
          name: "Custom templates",
          free: false,
          maker: false,
          pro: true,
          agency: true
        }
      ]
    },
    {
      category: "Deployment",
      features: [
        {
          name: "APK download",
          free: false,
          maker: true,
          pro: true,
          agency: true
        },
        {
          name: "PWA hosting",
          free: "0",
          maker: "3 apps",
          pro: "10 apps",
          agency: "Unlimited"
        },
        {
          name: "Play Store submissions/month",
          free: "0",
          maker: "0",
          pro: "3",
          agency: "Unlimited"
        },
        {
          name: "Auto app store optimization",
          free: false,
          maker: false,
          pro: true,
          agency: true
        }
      ]
    },
    {
      category: "Integrations",
      features: [
        {
          name: "Firebase integration",
          free: false,
          maker: true,
          pro: true,
          agency: true
        },
        {
          name: "AdMob monetization",
          free: false,
          maker: false,
          pro: true,
          agency: true
        },
        {
          name: "Custom domains for PWAs",
          free: false,
          maker: false,
          pro: false,
          agency: true
        },
        {
          name: "White-label branding",
          free: false,
          maker: false,
          pro: false,
          agency: true
        }
      ]
    },
    {
      category: "Support & Features",
      features: [
        {
          name: "Version history",
          free: "5 versions",
          maker: "20 versions",
          pro: "Unlimited",
          agency: "Unlimited"
        },
        {
          name: "Priority builds",
          free: false,
          maker: false,
          pro: true,
          agency: true
        },
        {
          name: "Support level",
          free: "Community",
          maker: "Email (48h)",
          pro: "Priority (24h)",
          agency: "Dedicated (2h)"
        },
        {
          name: "Analytics & insights",
          free: "Basic",
          maker: "Basic",
          pro: "Advanced",
          agency: "Enterprise"
        }
      ]
    }
  ];

  const renderFeatureValue = (value: any, isPro = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      );
    }
    return (
      <span className={isPro ? 'font-semibold text-primary' : 'text-white'}>
        {value}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="navbar-glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AppForge</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-muted hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="text-white font-medium">Pricing</Link>
              <Link href="/#examples" className="text-muted hover:text-white transition-colors">Examples</Link>
            </div>

            <Link href="/dashboard">
              <Button size="md">
                Start Building — Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-6"
                variants={fadeInUp}
              >
                <span className="gradient-text">Simple, Transparent Pricing</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted max-w-2xl mx-auto mb-8"
                variants={fadeInUp}
              >
                Choose the plan that fits your needs. Start free, upgrade when you're ready to scale.
              </motion.p>

              {/* Billing Toggle */}
              <motion.div 
                className="flex items-center justify-center gap-3 mb-12"
                variants={fadeInUp}
              >
                <span className={`text-sm ${!isYearly ? 'text-white' : 'text-muted'}`}>Monthly</span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-surface'}`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                    animate={{ x: isYearly ? 32 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm ${isYearly ? 'text-white' : 'text-muted'}`}>Yearly</span>
                {isYearly && <Badge variant="success" size="sm">Save 25%</Badge>}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {Object.values(PLANS).map((plan) => (
                <motion.div key={plan.id} variants={fadeInUp}>
                  <Card className={`relative h-full ${plan.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''}`}>
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant={plan.popular ? 'default' : 'secondary'} size="sm">
                          {plan.popular && <Star className="w-3 h-3 mr-1" />}
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pt-8 pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(plan, isYearly)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-muted text-sm">/mo</span>
                        )}
                      </div>
                      {isYearly && plan.price > 0 && (
                        <div className="text-xs text-green-400 mt-1">
                          Save {isIndianUser() 
                            ? `₹${(plan.priceINR - plan.priceYearlyINR) * 12}` 
                            : `$${(plan.price - plan.priceYearly) * 12}`}/year
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link href={plan.price === 0 ? '/try' : (getCheckoutUrl(plan.id, isYearly) || '/signup')}>
                        <Button 
                          className="w-full mb-6" 
                          variant={plan.popular ? 'primary' : 'secondary'}
                          size="md"
                        >
                          {plan.price === 0 ? 'Start Building — Free' : 'Start Free Trial'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-white/80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 border-t border-border/50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="gradient-text">Frequently Asked Questions</span>
            </h2>
            <div className="space-y-4">
              {pricingFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="glass rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-white pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-muted transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-white/70 text-sm leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to build your app?</h2>
            <p className="text-muted mb-8">Start for free. No credit card required. Upgrade anytime.</p>
            <Link href="/signup">
              <Button size="xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Building — Free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}