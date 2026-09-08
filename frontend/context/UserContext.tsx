import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  auth as authApi,
  profile as profileApi,
  estates as estatesApi,
  houses as housesApi,
  proposals as proposalsApi,
  notifications as notificationsApi,
  maintenance as maintenanceApi,
  paymentOptions as paymentOptionsApi,
  inquiries as inquiriesApi,
} from "../api";
import type {
  User,
  UserRole,
  Estate,
  House,
  Notification,
  MaintenanceIssue,
  PaymentOption,
  Inquiry,
  RentalProposal,
} from "../types";

const NAIROBI_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format";
const BUILDING_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&auto=format";

const INITIAL_ESTATES: Estate[] = [
  {
    id: "estate-1",
    name: "Greenfield Heights",
    location: "Westlands",
    county: "Nairobi",
    units: 48,
    totalArea: 12500,
    description:
      "A premium residential estate nestled in the heart of Westlands, offering modern units with stunning city views and world-class amenities.",
    managementName: "Greenfield Management Ltd",
    managementEmail: "info@greenfield.gmail.com",
    managementPhone: "+254712345678",
    titleDeedNumber: "TD-NBI-2019-00234",
    estatePhoto: NAIROBI_IMAGE,
    amenityPhotos: [BUILDING_IMAGE],
    status: "approved",
    adminId: "user-estate-admin",
    submittedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "estate-2",
    name: "Nakuru Gardens",
    location: "Milimani",
    county: "Nakuru",
    units: 32,
    totalArea: 8200,
    description:
      "Tranquil estate in Milimani offering spacious units with lush gardens and 24/7 security.",
    managementName: "Nakuru Gardens Management",
    managementEmail: "admin@nakurugarden.gmail.com",
    managementPhone: "+254723456789",
    titleDeedNumber: "TD-NKR-2020-00098",
    estatePhoto: BUILDING_IMAGE,
    amenityPhotos: [],
    status: "approved",
    adminId: "user-2",
    submittedAt: "2024-02-05T10:00:00Z",
  },
  {
    id: "estate-3",
    name: "Mombasa Breeze",
    location: "Nyali",
    county: "Mombasa",
    units: 24,
    totalArea: 6000,
    description:
      "Coastal living at its finest. Units with ocean breezes, proximity to the beach, and modern facilities.",
    managementName: "Breeze Properties Ltd",
    managementEmail: "hello@mombasabreeze.gmail.com",
    managementPhone: "+254734567890",
    titleDeedNumber: "TD-MSA-2021-00156",
    estatePhoto:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format",
    amenityPhotos: [],
    status: "pending",
    adminId: "user-3",
    submittedAt: "2024-03-01T08:00:00Z",
  },
];

const INITIAL_HOUSES: House[] = [
  {
    id: "house-1",
    estateId: "estate-1",
    houseNumber: "A-101",
    totalArea: 85,
    rooms: 2,
    photos: [NAIROBI_IMAGE],
    amenities: ["WiFi", "Parking", "Water 24/7", "Security"],
    rentAmount: 35000,
    managerPhone: "+254712345678",
    status: "vacant",
  },
  {
    id: "house-2",
    estateId: "estate-1",
    houseNumber: "A-102",
    totalArea: 95,
    rooms: 3,
    photos: [BUILDING_IMAGE],
    amenities: ["WiFi", "Parking", "Gym", "Pool", "Security"],
    rentAmount: 55000,
    managerPhone: "+254712345678",
    status: "vacant",
  },
  {
    id: "house-3",
    estateId: "estate-1",
    houseNumber: "B-201",
    totalArea: 75,
    rooms: 2,
    photos: [NAIROBI_IMAGE],
    amenities: ["WiFi", "Water 24/7"],
    rentAmount: 28000,
    managerPhone: "+254712345678",
    status: "occupied",
    occupiedAt: new Date().toISOString(),
    tenantName: "John Kamau",
    paymentStatus: "paid",
  },
  {
    id: "house-4",
    estateId: "estate-2",
    houseNumber: "G-01",
    totalArea: 110,
    rooms: 3,
    photos: [BUILDING_IMAGE],
    amenities: ["Parking", "Garden", "Security"],
    rentAmount: 42000,
    managerPhone: "+254723456789",
    status: "vacant",
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    estateId: "estate-1",
    title: "Water Maintenance Scheduled",
    eventDate: "2024-04-20T09:00:00Z",
    description:
      "Water supply will be interrupted from 9 AM to 1 PM for pipe maintenance. Please store water in advance.",
    createdAt: "2024-04-15T14:00:00Z",
  },
];

const INITIAL_MAINTENANCE: MaintenanceIssue[] = [
  {
    id: "maint-1",
    estateId: "estate-1",
    title: "Parking Lot Lighting Repair",
    description:
      "Several lights in the parking lot are not working. Electrician scheduled.",
    status: "in_progress",
    createdAt: "2024-04-10T10:00:00Z",
  },
  {
    id: "maint-2",
    estateId: "estate-1",
    title: "Lobby Renovation",
    description: "Lobby will be repainted and new flooring installed.",
    status: "scheduled",
    createdAt: "2024-04-12T09:00:00Z",
  },
];

const INITIAL_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "pay-1",
    estateId: "estate-1",
    name: "M-Pesa",
    details: "Paybill: 800200, Account: Unit Number",
  },
  {
    id: "pay-2",
    estateId: "estate-1",
    name: "Bank Transfer",
    details:
      "Equity Bank, Account: 1234567890, Name: Greenfield Management Ltd",
  },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    estateId: "estate-1",
    houseId: "house-3",
    tenantId: "user-tenant",
    tenantName: "John Kamau",
    unit: "B-201",
    message:
      "When will the gym be open again? It has been closed for two weeks.",
    status: "pending",
    createdAt: "2024-04-14T11:00:00Z",
  },
];

const DEMO_USERS: Record<string, User> = {
  communest_admin: {
    id: "user-communest-admin",
    name: "Admin Wanjiku",
    email: "admin@communest.gmail.com",
    phone: "+254700000001",
    role: "communest_admin",
    emailVerified: true,
    phoneVerified: true,
  },
  estate_admin: {
    id: "user-estate-admin",
    name: "Peter Mwangi",
    email: "peter@greenfield.gmail.com",
    phone: "+254700000002",
    role: "estate_admin",
    emailVerified: true,
    phoneVerified: true,
    estateId: "estate-1",
    profilePicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format",
  },
  tenant: {
    id: "user-tenant",
    name: "John Kamau",
    email: "john@gmail.com",
    phone: "+254700000003",
    role: "tenant",
    emailVerified: true,
    phoneVerified: true,
    estateId: "estate-1",
    profilePicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format",
  },
  regular_user: {
    id: "user-regular",
    name: "Grace Otieno",
    email: "grace@gmail.com",
    phone: "+254700000004",
    role: "regular_user",
    emailVerified: true,
    phoneVerified: false,
  },
};

interface AppDataContextType {
  estates: Estate[];
  houses: House[];
  notifications: Notification[];
  maintenanceIssues: MaintenanceIssue[];
  paymentOptions: PaymentOption[];
  inquiries: Inquiry[];
  proposals: RentalProposal[];
  setEstates: React.Dispatch<React.SetStateAction<Estate[]>>;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setMaintenanceIssues: React.Dispatch<
    React.SetStateAction<MaintenanceIssue[]>
  >;
  setPaymentOptions: React.Dispatch<React.SetStateAction<PaymentOption[]>>;
  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>;
  setProposals: React.Dispatch<React.SetStateAction<RentalProposal[]>>;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerUser: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  setUser: () => {},
  login: () => {},
  loginWithCredentials: async () => {},
  registerUser: async () => {},
  logout: () => {},
  isLoggedIn: false,
});

const AppDataContext = createContext<AppDataContextType>({
  estates: [],
  houses: [],
  notifications: [],
  maintenanceIssues: [],
  paymentOptions: [],
  inquiries: [],
  proposals: [],
  setEstates: () => {},
  setHouses: () => {},
  setNotifications: () => {},
  setMaintenanceIssues: () => {},
  setPaymentOptions: () => {},
  setInquiries: () => {},
  setProposals: () => {},
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState<
    MaintenanceIssue[]
  >([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [proposals, setProposals] = useState<RentalProposal[]>([]);

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const publicEstates = await estatesApi.list();
        setEstates(publicEstates);
        const publicHouses = await Promise.all(
          publicEstates.map((estate) => housesApi.list(estate.id)),
        );
        setHouses(publicHouses.flat());
      } catch {
        setEstates([]);
        setHouses([]);
      }
    };
    loadPublicData();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("communest_token");
      if (savedToken) {
        try {
          const dto = await profileApi.get(savedToken);
          setToken(savedToken);
          setUser({
            id: dto.id,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: dto.role as UserRole,
            profilePicture: dto.profilePicture,
            emailVerified: dto.emailVerified,
            phoneVerified: dto.phoneVerified,
            estateId: dto.estateId,
          });
          return;
        } catch {
          localStorage.removeItem("communest_token");
        }
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const dto = await profileApi.get(session.access_token);
          setToken(session.access_token);
          setUser({
            id: dto.id,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: dto.role as UserRole,
            profilePicture: dto.profilePicture,
            emailVerified: dto.emailVerified,
            phoneVerified: dto.phoneVerified,
            estateId: dto.estateId,
          });
          return;
        } catch {
          /* fall through */
        }
      }
      const saved = localStorage.getItem("communest_role");
      if (saved && saved in DEMO_USERS) setUser(DEMO_USERS[saved]);
    };
    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setToken(null);
      }
      if (event === "TOKEN_REFRESHED" && session)
        setToken(session.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!token || !user?.estateId || user.role === "regular_user") return;

    const loadPrivateData = async () => {
      const estateId = user.estateId as string;
      const [
        privateEstate,
        privateHouses,
        loadedNotifications,
        loadedMaintenance,
        loadedPayments,
        loadedInquiries,
        loadedProposals,
      ] = await Promise.all([
        estatesApi.get(estateId).catch(() => null),
        housesApi.list(estateId).catch(() => []),
        notificationsApi.list(token, estateId).catch(() => []),
        maintenanceApi.list(token, estateId).catch(() => []),
        paymentOptionsApi.list(token, estateId).catch(() => []),
        user.role === "estate_admin"
          ? inquiriesApi.list(token, estateId).catch(() => [])
          : Promise.resolve([]),
        user.role === "estate_admin"
          ? proposalsApi.list(token, estateId).catch(() => [])
          : Promise.resolve([]),
      ]);
      if (privateEstate) {
        setEstates((previous) => [
          ...previous.filter((estate) => estate.id !== privateEstate.id),
          privateEstate,
        ]);
      }
      setHouses((previous) => [
        ...previous.filter((house) => house.estateId !== estateId),
        ...privateHouses,
      ]);
      setNotifications(loadedNotifications);
      setMaintenanceIssues(loadedMaintenance);
      setPaymentOptions(loadedPayments);
      setInquiries(loadedInquiries);
      setProposals(loadedProposals);
    };
    loadPrivateData();
  }, [token, user?.estateId, user?.role]);

  const login = (role: UserRole) => {
    const u = role === "outsider" ? null : (DEMO_USERS[role] ?? null);
    setUser(u);
    setToken(null);
    localStorage.removeItem("communest_token");
    if (u) localStorage.setItem("communest_role", role);
    else localStorage.removeItem("communest_role");
  };

  const loginWithCredentials = async (email: string, password: string) => {
    const { token: jwt, user: dto } = await authApi.login({ email, password });
    setToken(jwt);
    localStorage.setItem("communest_token", jwt);
    setUser({
      id: dto.id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role as UserRole,
      profilePicture: dto.profilePicture,
      emailVerified: dto.emailVerified,
      phoneVerified: dto.phoneVerified,
      estateId: dto.estateId,
    });
    localStorage.removeItem("communest_role");
  };

  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => {
    await authApi.register({ name, email, phone, password });
  };

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        /* ignore */
      }
    }
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    localStorage.removeItem("communest_token");
    localStorage.removeItem("communest_role");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        loginWithCredentials,
        registerUser,
        logout,
        isLoggedIn: !!user,
      }}
    >
      <AppDataContext.Provider
        value={{
          estates,
          houses,
          notifications,
          maintenanceIssues,
          paymentOptions,
          inquiries,
          proposals,
          setEstates,
          setHouses,
          setNotifications,
          setMaintenanceIssues,
          setPaymentOptions,
          setInquiries,
          setProposals,
        }}
      >
        {children}
      </AppDataContext.Provider>
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
export const useAppData = () => useContext(AppDataContext);
