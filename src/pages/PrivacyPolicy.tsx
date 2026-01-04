import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-amber-100 hover:text-white hover:bg-amber-700/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <Card className="bg-amber-950/80 border-amber-700 text-amber-100">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-amber-100">
              Privacy Policy
            </CardTitle>
            <p className="text-amber-300 text-sm">Last updated: January 4, 2025</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Introduction</h2>
              <p className="text-amber-100/90 leading-relaxed">
                TicTacChec ("we," "our," or "us"), operated by PandO Holdings LLC, values your privacy. 
                This Privacy Policy explains how we handle information when you use the TicTacChec app 
                and website at tictacchec.com.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Information We Collect</h2>
              <p className="text-amber-100/90 leading-relaxed mb-4">
                <strong>TicTacChec does not collect, store, or transmit personal information</strong> such as 
                names, email addresses, or payment details.
              </p>
              <p className="text-amber-100/90 leading-relaxed mb-3">
                We may collect anonymous usage data to improve app performance and user experience:
              </p>
              <ul className="list-disc list-inside text-amber-100/80 space-y-2 ml-2">
                <li>
                  <strong>Anonymous Analytics:</strong> Device type, pages visited, time spent, and approximate 
                  geographic location (country/region level). No personally identifiable information is collected.
                </li>
                <li>
                  <strong>Local Game Data:</strong> Your game statistics (wins, losses, streaks) are stored 
                  only on your device using your browser's local storage. This data never leaves your browser 
                  and is not transmitted to any server.
                </li>
              </ul>
            </section>

            {/* 3. How Information Is Used */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">How Information Is Used</h2>
              <p className="text-amber-100/90 leading-relaxed mb-3">
                Any information collected is used solely to operate and improve the game experience and 
                ensure the app functions correctly.
              </p>
              <ul className="list-disc list-inside text-amber-100/80 space-y-2 ml-2">
                <li>Analytics data helps us understand how players interact with the game</li>
                <li>Local storage data is used solely to display your personal game statistics</li>
              </ul>
            </section>

            {/* 4. Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Data Sharing</h2>
              <p className="text-amber-100/90 leading-relaxed mb-3">
                <strong>TicTacChec does not sell or share personal data with third parties.</strong>
              </p>
              <p className="text-amber-100/90 leading-relaxed">
                Anonymous analytics data may be processed by trusted service providers (Google Analytics) 
                solely for performance and stability purposes, in accordance with{" "}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Google's Privacy Policy
                </a>.
              </p>
            </section>

            {/* 5. Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Children's Privacy</h2>
              <p className="text-amber-100/90 leading-relaxed">
                TicTacChec does not knowingly collect personal information from children under the age of 13. 
                If such information is inadvertently collected, it will be promptly deleted.
              </p>
            </section>

            {/* 6. Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Data Security</h2>
              <p className="text-amber-100/90 leading-relaxed">
                We take reasonable measures to protect information and ensure data is handled securely.
              </p>
            </section>

            {/* 7. Changes to This Policy */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Changes to This Policy</h2>
              <p className="text-amber-100/90 leading-relaxed">
                This Privacy Policy may be updated from time to time. Any changes will be posted on this page.
              </p>
            </section>

            {/* 8. Contact Information */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Contact Information</h2>
              <p className="text-amber-100/90 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <a 
                href="mailto:play@spoilroyale.com"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium"
              >
                <Mail className="w-4 h-4" />
                play@spoilroyale.com
              </a>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
