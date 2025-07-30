import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Sidebar } from "@/components/ui/sidebar";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import FAQ from "@/pages/faq";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Templates from "@/pages/templates";
import PromptBuilder from "@/pages/prompt-builder";
import Analytics from "@/pages/analytics";
import Billing from "@/pages/billing";
import Auth from "@/pages/auth";
import AuthCallback from "@/pages/auth-callback";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import Integrations from "@/pages/integrations";
import TeamCollaboration from "@/pages/team-collaboration";
import Chat from "@/pages/chat";
import Support from "@/pages/support";
import Prompts from "@/pages/prompts";
import BrandVoice from "@/pages/brand-voice";
import PromptLibrary from "@/pages/prompt-library";
import DailySummary from "@/pages/daily-summary";
import Collaboration from "@/pages/collaboration";
import CustomPrompts from "@/pages/custom-prompts";
import LeadCapture from "@/pages/lead-capture";
import Export from "@/pages/export";
import RealTimeAnalytics from "@/pages/real-time-analytics";
import WorkflowBuilder from "@/pages/workflow-builder";
import CustomModel from "@/pages/custom-model";
import SecurityCompliance from "@/pages/security-compliance";
import WhiteLabel from "@/pages/white-label";
import WebhooksZapier from "@/pages/webhooks-zapier";
import Inbox from "@/pages/inbox";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show non-authenticated routes when not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/auth" component={Auth} />
            <Route path="/auth-callback" component={AuthCallback} />
            <Route path="/contact" component={Contact} />
            <Route path="/about" component={About} />
            <Route path="/faq" component={FAQ} />
            {/* Protected routes - redirect to auth with return URL */}
            <Route path="/dashboard" component={() => {
              window.location.href = '/auth?returnTo=%2Fdashboard';
              return null;
            }} />
            <Route path="/templates" component={() => {
              window.location.href = '/auth?returnTo=%2Ftemplates';
              return null;
            }} />
            <Route path="/prompt-builder" component={() => {
              window.location.href = '/auth?returnTo=%2Fprompt-builder';
              return null;
            }} />
            <Route path="/analytics" component={() => {
              window.location.href = '/auth?returnTo=%2Fanalytics';
              return null;
            }} />
            <Route path="/chat" component={() => {
              window.location.href = '/auth?returnTo=%2Fchat';
              return null;
            }} />
            <Route path="/integrations" component={() => {
              window.location.href = '/auth?returnTo=%2Fintegrations';
              return null;
            }} />
            <Route path="/custom-prompts" component={() => {
              window.location.href = '/auth?returnTo=%2Fcustom-prompts';
              return null;
            }} />
            <Route path="/brand-voice" component={() => {
              window.location.href = '/auth?returnTo=%2Fbrand-voice';
              return null;
            }} />
            <Route path="/support" component={() => {
              window.location.href = '/auth?returnTo=%2Fsupport';
              return null;
            }} />
            <Route path="/home" component={() => {
              window.location.href = '/auth?returnTo=%2Fhome';
              return null;
            }} />
            <Route path="/settings" component={() => {
              window.location.href = '/auth?returnTo=%2Fsettings';
              return null;
            }} />
            {/* Default fallback to home instead of auth */}
            <Route component={() => {
              window.location.href = '/';
              return null;
            }} />
          </Switch>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Switch>
      {/* Authenticated top navigation pages - these have their own TopNavbar */}
      <Route path="/home" component={Home} />
      <Route path="/settings" component={Settings} />
      
      {/* Auth callback page - accessible regardless of authentication state */}
      <Route path="/auth-callback" component={AuthCallback} />
      
      {/* Also handle billing page with TopNavbar */}
      <Route path="/billing" component={() => (
        <div className="min-h-screen">
          <Billing />
        </div>
      )} />
      
      {/* Public pages accessible when authenticated - wrapped with layout */}
      <Route path="/faq" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <FAQ />
          </main>
          <Footer />
        </div>
      )} />
      <Route path="/contact" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Contact />
          </main>
          <Footer />
        </div>
      )} />
      <Route path="/about" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <About />
          </main>
          <Footer />
        </div>
      )} />
      <Route path="/pricing" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Pricing />
          </main>
          <Footer />
        </div>
      )} />

      {/* Dashboard with sidebar pages */}
      <Route path="/dashboard" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Dashboard />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/inbox" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Inbox />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/templates" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Templates />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/prompt-builder" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <PromptBuilder />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/analytics" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Analytics />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/real-time-analytics" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <RealTimeAnalytics />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/workflow-builder" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <WorkflowBuilder />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/custom-model" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <CustomModel />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/integrations" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Integrations />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/team" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <TeamCollaboration />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/chat" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Chat />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/support" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Support />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/analytics" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Analytics />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/prompts" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Prompts />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/brand-voice" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <BrandVoice />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/prompt-library" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <PromptLibrary />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/daily-summary" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <DailySummary />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/collaboration" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Collaboration />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/custom-prompts" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <CustomPrompts />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/lead-capture" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <LeadCapture />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/export" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <Export />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/security" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <SecurityCompliance />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/white-label" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <WhiteLabel />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />
      <Route path="/webhooks" component={() => (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar>
              <WebhooksZapier />
            </Sidebar>
          </div>
          <Footer />
        </div>
      )} />

      {/* Default route - redirect to home */}
      <Route path="/" component={Home} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
