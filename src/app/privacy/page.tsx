import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - AppForge",
  description: "Privacy Policy for AppForge AI mobile app builder platform. Learn how we protect your data.",
};

export default function PrivacyPage() {
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
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
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
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Last updated: January 15, 2026
            </p>

            {/* Privacy Commitment Icons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-xs font-semibold">Data Protected</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-xs font-semibold">Transparent</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <Lock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-xs font-semibold">Encrypted</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <UserCheck className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-xs font-semibold">User Control</div>
              </div>
            </div>

            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
              <h2>Our Privacy Commitment</h2>
              <p>
                At AppForge, we believe privacy is a fundamental right. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our AI-powered mobile app development platform.
              </p>

              <h2>1. Information We Collect</h2>
              
              <h3>1.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
                <li><strong>App Content:</strong> Applications you create, including designs, code, and data</li>
                <li><strong>Communication Data:</strong> Messages you send to our support team or through the platform</li>
                <li><strong>Payment Information:</strong> Credit card details and billing information (processed securely by our payment providers)</li>
              </ul>

              <h3>1.2 Information We Automatically Collect</h3>
              <ul>
                <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
                <li><strong>Log Data:</strong> Server logs, error reports, and performance metrics</li>
                <li><strong>Cookies and Tracking:</strong> See our Cookie Policy section below</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li><strong>Provide our Service:</strong> Enable app creation, hosting, and deployment</li>
                <li><strong>Improve our Platform:</strong> Analyze usage patterns to enhance features and performance</li>
                <li><strong>Personalize Experience:</strong> Customize interface and recommendations based on your preferences</li>
                <li><strong>Communicate:</strong> Send service updates, security alerts, and support messages</li>
                <li><strong>Process Payments:</strong> Handle billing and subscription management</li>
                <li><strong>Ensure Security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
                <li><strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
              </ul>

              <h2>3. AI and Machine Learning</h2>
              <h3>3.1 How AI Uses Your Data</h3>
              <p>
                Our AI systems process your app descriptions and designs to generate mobile applications. This involves:
              </p>
              <ul>
                <li>Analyzing your text prompts to understand requirements</li>
                <li>Processing design preferences and feedback</li>
                <li>Learning from anonymized usage patterns to improve suggestions</li>
              </ul>

              <h3>3.2 Data Training</h3>
              <p>
                We may use anonymized and aggregated data to train our AI models, but we never use your specific app content or personal information for training without explicit consent.
              </p>

              <h2>4. Information Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share information in these limited circumstances:</p>

              <h3>4.1 Service Providers</h3>
              <p>We work with trusted third parties who help us operate our platform:</p>
              <ul>
                <li><strong>Cloud Hosting:</strong> AWS, Google Cloud for secure data storage</li>
                <li><strong>Payment Processing:</strong> Stripe, PayPal for secure payment handling</li>
                <li><strong>Analytics:</strong> Privacy-focused analytics to understand platform usage</li>
                <li><strong>Email Service:</strong> For sending transactional and marketing emails</li>
              </ul>

              <h3>4.2 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul>
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate potential violations of our terms</li>
                <li>Prevent fraud or security threats</li>
              </ul>

              <h3>4.3 Business Transfers</h3>
              <p>
                In case of merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections.
              </p>

              <h2>5. Data Security</h2>
              <p>We implement industry-standard security measures:</p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256</li>
                <li><strong>Access Controls:</strong> Strict employee access controls and regular security audits</li>
                <li><strong>Secure Infrastructure:</strong> SOC 2 compliant cloud providers with 99.9% uptime</li>
                <li><strong>Regular Testing:</strong> Penetration testing and vulnerability assessments</li>
                <li><strong>Incident Response:</strong> 24/7 monitoring and rapid response to security events</li>
              </ul>

              <h2>6. Data Retention</h2>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services and support your apps</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p>
                You can delete your account at any time, and we will delete your personal information within 30 days, except where required by law to retain certain records.
              </p>

              <h2>7. Your Privacy Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correct:</strong> Update or correct inaccurate information</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Port:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restrict:</strong> Limit how we process your information</li>
                <li><strong>Object:</strong> Opt-out of certain processing activities</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent for processing based on consent</li>
              </ul>

              <h2>8. Cookie Policy</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li><strong>Essential:</strong> Enable core platform functionality</li>
                <li><strong>Performance:</strong> Monitor and improve platform performance</li>
                <li><strong>Functional:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics:</strong> Understand how you use our platform</li>
              </ul>
              <p>You can control cookies through your browser settings, but this may affect platform functionality.</p>

              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be processed in countries other than your own. We ensure adequate protection through:
              </p>
              <ul>
                <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                <li>Privacy Shield framework compliance where applicable</li>
                <li>Adequacy decisions recognized by local privacy authorities</li>
              </ul>

              <h2>10. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us so we can delete such information.
              </p>

              <h2>11. Regional Privacy Laws</h2>
              
              <h3>11.1 European Union (GDPR)</h3>
              <p>If you're in the EU, you have additional rights under GDPR, including the right to lodge a complaint with your local data protection authority.</p>

              <h3>11.2 California (CCPA)</h3>
              <p>California residents have rights to know, delete, and opt-out of the sale of personal information. We do not sell personal information.</p>

              <h3>11.3 Other Jurisdictions</h3>
              <p>We comply with applicable privacy laws in all jurisdictions where we operate.</p>

              <h2>12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy to reflect changes in our practices or applicable laws. We will:
              </p>
              <ul>
                <li>Post the updated policy on our website</li>
                <li>Send email notifications for material changes</li>
                <li>Update the "Last Updated" date</li>
                <li>Provide a summary of key changes where appropriate</li>
              </ul>

              <h2>13. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal information:
              </p>
              <ul>
                <li><strong>Email:</strong> privacy@appforge.ai</li>
                <li><strong>Address:</strong> AppForge Inc., 1234 Innovation Drive, San Francisco, CA 94105</li>
                <li><strong>Privacy Officer:</strong> Available through our support portal</li>
              </ul>

              <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                <h3>Privacy Questions?</h3>
                <p className="mb-4">
                  We're committed to transparency. If you have any questions about how we handle your data, we're here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="mailto:privacy@appforge.ai">
                    <Button>Contact Privacy Team</Button>
                  </Link>
                  <Link href="/terms">
                    <Button variant="secondary">Terms of Service</Button>
                  </Link>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <h3 className="text-green-400 mb-2">🛡️ Privacy by Design</h3>
                <p className="text-sm">
                  Privacy isn't an afterthought at AppForge—it's built into everything we do. From our AI models to our data architecture, we prioritize your privacy at every step.
                </p>
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
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
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