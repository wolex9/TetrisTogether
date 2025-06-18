"use client";

import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth-context";

function countryCodeToFlag(countryCode?: string): string {
  if (!countryCode) return "🌏";
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0)),
  );
}

interface UserHoverCardProps {
  user: User;
  children: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string; // additional classes for the content
}

export function UserHoverCard({ user, children, triggerClassName, contentClassName }: UserHoverCardProps) {
  const flag = countryCodeToFlag(user.countryCode);

  return (
    <HoverCard>
      <HoverCardTrigger className={cn("cursor-pointer font-medium hover:underline", triggerClassName)}>
        {flag} {user.username}
      </HoverCardTrigger>
      <HoverCardContent className={cn("w-80 p-4", contentClassName)}>{children}</HoverCardContent>
    </HoverCard>
  );
}
