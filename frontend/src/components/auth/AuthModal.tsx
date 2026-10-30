import React, { useState } from "react";
import { Lock, Mail, CheckCircle2, Shield, X } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email?: string; isGuest: boolean };
  onSignIn: (email: string) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSignIn(email.trim());
    setSuccessMsg(isSignUp ? "Account created and session activated!" : "Signed in successfully!");
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 fade-in">
      <Card className="w-full max-w-md bg-white border border-border shadow-2xl p-6 relative hover-lift">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-text-subtle hover:text-text hover:bg-gray-100 transition-all duration-200 ease-out active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">
              {currentUser.isGuest ? (isSignUp ? "Create Pathwise Account" : "Sign In to Pathwise") : "Account Settings"}
            </h3>
            <p className="text-xs text-text-muted">
              {currentUser.isGuest
                ? "Sign in with Supabase Auth to persist your roadmaps across devices."
                : `Currently signed in as ${currentUser.email}`}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-accent-greenSubtle border border-accent-green/30 rounded-xl text-xs text-accent-green font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!currentUser.isGuest ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-border-light text-xs space-y-1">
              <div className="font-semibold text-text">Session Active</div>
              <div className="text-text-muted">Your roadmaps, progress checkpoints, and diagnostic quiz scores are synced to Supabase.</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full border-accent-rose text-accent-rose hover:bg-accent-rose hover:text-white"
            >
              Sign Out (Return to Guest Mode)
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="email"
                  required
                  placeholder="engineer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <Button variant="primary" size="sm" type="submit" className="w-full">
              {isSignUp ? "Sign Up & Enable Sync" : "Sign In & Sync Roadmaps"}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-primary hover:underline font-semibold"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
