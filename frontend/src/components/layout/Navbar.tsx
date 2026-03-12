import { ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { getInitials, shortenAddress } from "@/utils/format";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/warranties", label: "My Warranties" },
  { to: "/register-product", label: "Register Product" },
  { to: "/verify", label: "Verify" },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { connectAndLogin, connecting } = useWalletAuth();
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-1 to-brand-2 shadow-[0_0_16px_-2px_var(--color-brand-1)]">
            <ShieldCheck className="size-4.5 text-white" />
          </span>
          <span>WarrantyVault</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <Link to="/verify" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
              Verify a warranty
            </Link>
          )}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium">
                <Avatar>
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{shortenAddress(user.wallet)}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connectAndLogin} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
