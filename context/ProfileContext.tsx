import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type PreferredUnit = "ml" | "oz";
export type DrippyColor = "oceanBlue" | "softPurple" | "mintGreen" | "blushPink";

export type ProfileData = {
  age: number;
  heightCm: number;
  weightKg: number;
  preferredWaterUnit: PreferredUnit;
};

type ProfileContextValue = {
  profile: ProfileData | null;
  drippyColor: DrippyColor;
  isLoading: boolean;
  saveProfile: (data: ProfileData) => Promise<boolean>;
  setDrippyColor: (color: DrippyColor) => void;
};

const API_URL = "http://192.168.0.138:8080";

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapApiProfile(data: any): ProfileData | null {
  if (!data) {
    return null;
  }

  const preferredWaterUnit: PreferredUnit =
    (data.preferredWaterUnit ?? data.preferredUnit) === "oz" ? "oz" : "ml";
  const age = toNumber(data.age);
  const heightCm = toNumber(data.heightCm ?? data.height);
  const weightKg = toNumber(data.weightKg ?? data.weight);

  if (!age || !heightCm || !weightKg) {
    return null;
  }

  return {
    age,
    heightCm,
    weightKg,
    preferredWaterUnit,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [drippyColor, setDrippyColor] = useState<DrippyColor>("oceanBlue");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`);

        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(mapApiProfile(data));
        if (data?.drippyColor) {
          setDrippyColor(data.drippyColor);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async (data: ProfileData) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return false;
      }

      setProfile(data);
      // If backend happens to return drippyColor in the future, keep it in sync.
      if ((data as any).drippyColor) {
        setDrippyColor((data as any).drippyColor);
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      profile,
      drippyColor,
      isLoading,
      saveProfile,
      setDrippyColor,
    }),
    [drippyColor, isLoading, profile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }

  return context;
}

