import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - AppForge | Mobile App Development Insights",
  description: "Learn how to build mobile apps with AI, no-code development tips, and the future of app creation. Expert insights from the AppForge team.",
  keywords: "mobile app development, AI app builder, no-code, app development blog, mobile development, artificial intelligence",
  openGraph: {
    title: "AppForge Blog - Mobile App Development Insights",
    description: "Expert insights on AI-powered app development, no-code solutions, and mobile app creation",
    type: "website",
  }
};

const articles = [
  {
    slug: "build-mobile-app-without-coding-2026",
    title: "How to Build a Mobile App Without Coding in 2026",
    description: "Discover the latest no-code and AI-powered tools that make app development accessible to everyone. From idea to app store in days, not months.",
    category: "Tutorial",
    readTime: "8 min read",
    publishDate: "2026-01-15",
    featured: true,
    image: "gradient-to-r from-blue-600 to-purple-600"
  },
  {
    slug: "ai-vs-traditional-development-cost",
    title: "AI App Builder vs Traditional Development: Cost Comparison",
    description: "A comprehensive analysis of costs, time, and resources. Why AI-powered app development is revolutionizing the industry.",
    category: "Analysis",
    readTime: "12 min read", 
    publishDate: "2026-01-10",
    featured: true,
    image: "gradient-to-r from-green-600 to-blue-600"
  },
  {
    slug: "5-app-ideas-build-5-minutes",
    title: "5 App Ideas You Can Build in 5 Minutes",
    description: "Quick app ideas perfect for beginners. Step-by-step guides to create functional apps using AI-powered tools.",
    category: "Ideas",
    readTime: "6 min read",
    publishDate: "2026-01-05",
    featured: true,
    image: "gradient-to-r from-orange-600 to-red-600"
  },
  {
    slug: "mobile-app-design-trends-2026",
    title: "Mobile App Design Trends That Will Dominate 2026",
    description: "Stay ahead of the curve with the latest UI/UX trends, color schemes, and interaction patterns in mobile app design.",
    category: "Design",
    readTime: "10 min read",
    publishDate: "2025-12-28",
    featured: false,
    image: "gradient-to-r from-purple-600 to-pink-600"
  },
  {
    slug: "scaling-mobile-app-million-users",
    title: "Scaling Your Mobile App to 1 Million Users",
    description: "Technical strategies, infrastructure decisions, and growth tactics for building apps that can handle massive scale.",
    category: "Growth",
    readTime: "15 min read",
    publishDate: "2025-12-20",
    featured: false,
    image: "gradient-to-r from-teal-600 to-cyan-600"
  },
  {
    slug: "future-of-app-development-ai",
    title: "The Future of App Development: How AI is Changing Everything",
    description: "Explore how artificial intelligence is transforming app development, from automated coding to intelligent user experiences.",
    category: "Technology",
    readTime: "11 min read",
    publishDate: "2025-12-15",
    featured: false,
    image: "gradient-to-r from-indigo-600 to-purple-600"
  }
];

export default function BlogPage() {
  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold gradient-text">
              AppForge
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">AppForge</span> Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and expert analysis on mobile app development, AI-powered tools, and the future of no-code development.
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Articles</h2>
              <p className="text-muted-foreground">Our most popular and impactful content</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article, index) => (
              <Card key={article.slug} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50">
                <div className={`h-48 bg-${article.image} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-background/90 text-foreground">
                    {article.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.publishDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  
                  <Link href={`/blog/${article.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto group-hover:text-primary">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Articles</h2>
              <p className="text-muted-foreground">Stay updated with our latest insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regularArticles.map((article) => (
              <Card key={article.slug} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.publishDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {article.description}
                  </p>
                  
                  <Link href={`/blog/${article.slug}`}>
                    <Button variant="ghost" className="p-0 h-auto group-hover:text-primary">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest insights on app development, AI tools, and industry trends delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border/50 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2026 AppForge. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}