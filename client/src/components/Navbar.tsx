import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const navLinks = [
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Rewards', href: '/rewards' },
    { name: 'Winners', href: '/winners' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <nav className="fixed w-full z-30 shadow-md bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold gradient-text">Chillar Club</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-secondary px-3 py-2 text-sm font-medium"
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            {currentUser ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="ml-4">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                {currentUser.isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" className="bg-primary/20 text-primary hover:bg-primary/30">Admin</Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/join?mode=login">
                  <Button variant="outline" className="ml-4">Login</Button>
                </Link>
                <Link href="/join?mode=register">
                  <Button className="gradient-bg">Join Now</Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button onClick={toggleMenu} className="text-white p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 text-white font-medium hover:bg-muted rounded-md"
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            {currentUser ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 text-white font-medium hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }} 
                  className="block w-full text-left px-3 py-2 text-white font-medium hover:bg-muted rounded-md"
                >
                  Logout
                </button>
                {currentUser.isAdmin && (
                  <Link 
                    href="/admin" 
                    className="block px-3 py-2 text-white font-medium bg-primary/20 hover:bg-primary/30 rounded-md"
                    onClick={closeMenu}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/join?mode=login" 
                  className="block px-3 py-2 text-white font-medium hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  href="/join?mode=register" 
                  className="block px-3 py-2 gradient-bg text-white font-medium rounded-md"
                  onClick={closeMenu}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
