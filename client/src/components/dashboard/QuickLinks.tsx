import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, User, History, HelpCircle } from "lucide-react";

const QuickLinks = () => {
  const links = [
    {
      title: "Reward Calendar",
      icon: <Calendar className="mr-3 h-5 w-5" />,
      href: "/calendar",
    },
    {
      title: "Account Settings",
      icon: <User className="mr-3 h-5 w-5" />,
      href: "/account",
    },
    {
      title: "Past Rewards",
      icon: <History className="mr-3 h-5 w-5" />,
      href: "/calendar",
    },
    {
      title: "Help Center",
      icon: <HelpCircle className="mr-3 h-5 w-5" />,
      href: "/help",
    },
  ];

  return (
    <Card className="bg-card rounded-xl shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
        
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <Link 
                href={link.href} 
                className="flex items-center text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-background/50 transition"
              >
                {link.icon}
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickLinks;
