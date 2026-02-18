import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - AppForge",
  description: "Terms of Service for AppForge AI mobile app builder platform.",
};

export default function TermsPage() {
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
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/dashboard">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: January 15, 2026
            </p>

            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using AppForge ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                AppForge is an AI-powered mobile application development platform that allows users to create mobile applications through natural language descriptions and visual interfaces. The Service includes:
              </p>
              <ul>
                <li>AI-powered app generation</li>
                <li>Visual app builder interface</li>
                <li>Template library</li>
                <li>App deployment tools</li>
                <li>Cloud hosting services</li>
              </ul>

              <h2>3. User Accounts</h2>
              <p>
                To use certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your account information</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
              </ul>

              <h2>4. Acceptable Use</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul>
                <li>Create applications that violate any applicable laws or regulations</li>
                <li>Distribute malware, viruses, or other harmful code</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Create content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Use the Service for any commercial purposes beyond creating applications for your own use</li>
              </ul>

              <h2>5. Intellectual Property</h2>
              <h3>5.1 Your Content</h3>
              <p>
                You retain ownership of any content, applications, or intellectual property you create using the Service. By using the Service, you grant us a limited license to use, modify, and display your content solely for the purpose of providing the Service.
              </p>

              <h3>5.2 Our Intellectual Property</h3>
              <p>
                The Service, including all software, algorithms, designs, and documentation, is owned by AppForge and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.
              </p>

              <h2>6. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>

              <h2>7. Payment Terms</h2>
              <p>
                Certain features of the Service may require payment. By subscribing to paid plans:
              </p>
              <ul>
                <li>You agree to pay all fees according to the pricing terms in effect at the time</li>
                <li>Payments are non-refundable unless otherwise specified</li>
                <li>We may change our pricing with 30 days' notice</li>
                <li>Failure to pay may result in suspension or termination of your account</li>
              </ul>

              <h2>8. Service Availability</h2>
              <p>
                While we strive to provide reliable service, we do not guarantee that the Service will be available 100% of the time. We reserve the right to:
              </p>
              <ul>
                <li>Perform maintenance that may temporarily interrupt service</li>
                <li>Modify or discontinue features with reasonable notice</li>
                <li>Implement usage limits or restrictions</li>
              </ul>

              <h2>9. Data and Security</h2>
              <p>
                We implement reasonable security measures to protect your data, but cannot guarantee absolute security. You are responsible for:
              </p>
              <ul>
                <li>Backing up important data</li>
                <li>Using strong passwords and security practices</li>
                <li>Promptly reporting any security concerns</li>
              </ul>

              <h2>10. Termination</h2>
              <p>
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul>
                <li>Your access to the Service will cease</li>
                <li>You may download your applications and data for 30 days</li>
                <li>We may delete your account and associated data after the grace period</li>
                <li>All provisions that should survive termination will remain in effect</li>
              </ul>

              <h2>11. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h2>12. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>

              <h2>13. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless AppForge and its affiliates from any claims, damages, or expenses arising from your use of the Service or violation of these terms.
              </p>

              <h2>14. Changes to Terms</h2>
              <p>
                We may update these Terms of Service from time to time. We will notify you of significant changes by email or through the Service. Continued use after changes constitutes acceptance of the new terms.
              </p>

              <h2>15. Governing Law</h2>
              <p>
                These terms are governed by the laws of Delaware, United States, without regard to conflict of law principles. Any disputes will be resolved in the courts of Delaware.
              </p>

              <h2>16. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <ul>
                <li>Email: legal@appforge.ai</li>
                <li>Address: AppForge Inc., 1234 Innovation Drive, San Francisco, CA 94105</li>
              </ul>

              <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                <h3>Need Help?</h3>
                <p className="mb-4">
                  If you have questions about these terms or need assistance with our service, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="mailto:support@appforge.ai">
                    <Button>Contact Support</Button>
                  </Link>
                  <Link href="/privacy">
                    <Button variant="secondary">Privacy Policy</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2026 AppForge. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
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