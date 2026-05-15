"use client";

import { createContext, useContext } from "react";

export interface UserProfileData {
  name: string;
  initials: string;
  color: string | null;
  role: string;
}

const UserProfileContext = createContext<UserProfileData>({
  name: "Usuário",
  initials: "?",
  color: null,
  role: "admin",
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
