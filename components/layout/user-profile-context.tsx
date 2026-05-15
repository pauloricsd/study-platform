"use client";

import { createContext, useContext } from "react";

export interface UserProfileData {
  name: string;
  initials: string;
  color: string | null;
  /** The current view role — "admin" when inside admin layout, "student" inside student layout */
  role: "admin" | "student";
  /** Whether this account can switch between admin and student views */
  canSwitchRole: boolean;
}

const UserProfileContext = createContext<UserProfileData>({
  name: "Usuário",
  initials: "?",
  color: null,
  role: "admin",
  canSwitchRole: false,
});

export function UserProfileProvider({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: UserProfileData;
}) {
  return (
    <UserProfileContext.Provider value={profile}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
