"use client";

import Link from "next/link";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth-context";

function countryCodeToFlag(country_code?: string): string {
  if (!country_code) return "🌏";
  return String.fromCodePoint(
    ...country_code
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
  console.log(user);
  const flag = countryCodeToFlag(user.country_code);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/profile/${user.username}`}
          className={cn("cursor-pointer font-medium hover:underline", triggerClassName)}
        >
          {flag} {user.username}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className={cn("w-80 p-4", contentClassName)}>{children}</HoverCardContent>
    </HoverCard>
  );
}
