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
            {/* Who We Are */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Who We Are</h2>
              <p className="text-amber-100/90 leading-relaxed">
                The website <strong>tictacchec.com</strong> is operated by <strong>PandO Holdings LLC</strong>. 
                Tic Tac Chec is a browser-based strategy game that combines chess piece movement 
                with tic-tac-toe style winning conditions.
              </p>
            </section>

            {/* What Data We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">What Data We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-amber-300 mb-2">Google Analytics</h3>
                  <p className="text-amber-100/90 leading-relaxed mb-2">
                    We use Google Analytics to collect anonymous usage data, including:
                  </p>
                  <ul className="list-disc list-inside text-amber-100/80 space-y-1 ml-2">
                    <li>Pages visited and time spent on each page</li>
                    <li>Device type and browser information</li>
                    <li>Approximate geographic location (country/region level)</li>
                    <li>Referral sources (how you found us)</li>
                  </ul>
                  <p className="text-amber-100/90 mt-2">
                    <strong>No personally identifiable information</strong> is collected through Google Analytics.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-amber-300 mb-2">Local Storage</h3>
                  <p className="text-amber-100/90 leading-relaxed">
                    Your game statistics (wins, losses, streaks, games played) are stored <strong>only on your device</strong> using 
                    your browser's local storage. This data never leaves your browser and is not transmitted to any server. 
                    You can clear this data at any time by using the "Reset Stats" feature in the game or by clearing your browser data.
                  </p>
                </div>
              </div>
            </section>

            {/* How Data is Used */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">How Data is Used</h2>
              <ul className="list-disc list-inside text-amber-100/90 space-y-2 ml-2">
                <li>
                  <strong>Analytics data</strong> helps us understand how players interact with the game, 
                  allowing us to improve the user experience and fix issues.
                </li>
                <li>
                  <strong>Local storage data</strong> is used solely to display your personal game statistics 
                  and track your progress.
                </li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Data Sharing</h2>
              <ul className="list-disc list-inside text-amber-100/90 space-y-2 ml-2">
                <li>
                  Google Analytics data is processed by Google in accordance with their{" "}
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline"
                  >
                    Privacy Policy
                  </a>.
                </li>
                <li>
                  We do <strong>not</strong> sell, trade, or share your data with any other third parties.
                </li>
                <li>
                  Local storage data remains entirely on your device and is never transmitted.
                </li>
              </ul>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-semibold text-amber-200 mb-3">Contact Us</h2>
              <p className="text-amber-100/90 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, 
                please contact us at:
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
