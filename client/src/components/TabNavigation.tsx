import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface TabProps {
  href: string;
  label: string;
  isActive: boolean;
}

function Tab({ href, label, isActive }: TabProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "whitespace-nowrap py-4 px-1 font-medium text-sm border-b-2",
          isActive 
            ? "border-primary text-primary" 
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        )}
      >
        {label}
      </a>
    </Link>
  );
}

export default function TabNavigation() {
  const [location] = useLocation();
  
  const tabs = [
    { href: "/create", label: "Create Quiz" },
    { href: "/my-quizzes", label: "My Quizzes" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <Tab 
            key={tab.href}
            href={tab.href}
            label={tab.label}
            isActive={location === tab.href || (tab.href === "/create" && location === "/")}
          />
        ))}
      </nav>
    </div>
  );
}
