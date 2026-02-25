import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import History from "./pages/History";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import PendingApproval from "./pages/PendingApproval";
import MethodologyChoice from "./pages/MethodologyChoice";
import ProgramEvaluation from "./pages/ProgramEvaluation";
import AboutUs from "./pages/AboutUs";
import OrganizationSettings from "./pages/OrganizationSettings";
import ProjectDashboard from "./pages/ProjectDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import SustainabilityExpert from "./pages/SustainabilityExpert";
import SustainabilityList from "./pages/SustainabilityList";
import ResearchStudy from "./pages/ResearchStudy";
import ResearchList from "./pages/ResearchList";
import ColorSettings from "./pages/ColorSettings";
import { Milestone1Demo } from "./components/SlideBuilder/Milestone1Demo";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/home" component={() => <ProtectedRoute component={Home} />} />
      <Route path={"/history"} component={() => <ProtectedRoute component={History} />} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path={"/pending"} component={() => <ProtectedRoute component={PendingApproval} />} />
      <Route path={"/methodology-choice"} component={() => <ProtectedRoute component={MethodologyChoice} />} />
      <Route path={"/program-evaluation"} component={() => <ProtectedRoute component={ProgramEvaluation} />} />
      <Route path={"/about"} component={() => <ProtectedRoute component={AboutUs} />} />
      <Route path={"/organization-settings"} component={() => <ProtectedRoute component={OrganizationSettings} />} />
      <Route path={"/project-dashboard/:id"} component={() => <ProtectedRoute component={ProjectDashboard} />} />
      <Route path={"/admin/analytics"} component={() => <ProtectedRoute component={AdminAnalytics} />} />
      <Route path={"/sustainability"} component={() => <ProtectedRoute component={SustainabilityList} />} />
      <Route path={"/sustainability/:id"} component={() => <ProtectedRoute component={SustainabilityExpert} />} />
      <Route path={"/research"} component={() => <ProtectedRoute component={ResearchList} />} />
      <Route path={"/research/:id"} component={() => <ProtectedRoute component={ResearchStudy} />} />
      <Route path={"/color-settings"} component={() => <ProtectedRoute component={ColorSettings} />} />
      <Route path={"/milestone1-test"} component={() => <ProtectedRoute component={Milestone1Demo} />} />
      <Route path={"/404"} component={NotFound} />
      <Route path="" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
