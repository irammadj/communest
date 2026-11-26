import React, { createContext, useContext, useState, useEffect } from "react"

import { supabase } from "../lib/supabase"

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
} from "../api"

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
} from "../types"

interface AppDataContextType {
  estates: Estate[]

  houses: House[]

  notifications: Notification[]

  maintenanceIssues: MaintenanceIssue[]

  paymentOptions: PaymentOption[]

  inquiries: Inquiry[]

  proposals: RentalProposal[]

  dataError: string | null

  dataReloadKey: number

  setDataError: React.Dispatch<React.SetStateAction<string | null>>

  retryData: () => void

  setEstates: React.Dispatch<React.SetStateAction<Estate[]>>

  setHouses: React.Dispatch<React.SetStateAction<House[]>>

  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>

  setMaintenanceIssues: React.Dispatch<React.SetStateAction<MaintenanceIssue[]>>

  setPaymentOptions: React.Dispatch<React.SetStateAction<PaymentOption[]>>

  setInquiries: React.Dispatch<React.SetStateAction<Inquiry[]>>

  setProposals: React.Dispatch<React.SetStateAction<RentalProposal[]>>
}

interface UserContextType {
  user: User | null

  token: string | null

  setUser: React.Dispatch<React.SetStateAction<User | null>>

  loginWithCredentials: (email: string, password: string) => Promise<void>

  registerUser: (
    name: string,

    email: string,

    phone: string,

    password: string,
  ) => Promise<void>

  logout: () => void

  isLoggedIn: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,

  token: null,

  setUser: () => {},

  loginWithCredentials: async () => {},

  registerUser: async () => {},

  logout: () => {},

  isLoggedIn: false,
})

const AppDataContext = createContext<AppDataContextType>({
  estates: [],

  houses: [],

  notifications: [],

  maintenanceIssues: [],

  paymentOptions: [],

  inquiries: [],

  proposals: [],

  dataError: null,

  dataReloadKey: 0,

  setDataError: () => {},

  retryData: () => {},

  setEstates: () => {},

  setHouses: () => {},

  setNotifications: () => {},

  setMaintenanceIssues: () => {},

  setPaymentOptions: () => {},

  setInquiries: () => {},

  setProposals: () => {},
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const [token, setToken] = useState<string | null>(null)

  const [estates, setEstates] = useState<Estate[]>([])

  const [houses, setHouses] = useState<House[]>([])

  const [notifications, setNotifications] = useState<Notification[]>([])

  const [maintenanceIssues, setMaintenanceIssues] =
    useState<MaintenanceIssue[]>([])

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])

  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  const [proposals, setProposals] = useState<RentalProposal[]>([])

  const [dataError, setDataError] = useState<string | null>(null)

  const [dataReloadKey, setDataReloadKey] = useState(0)

  const retryData = () => {
    setDataError(null)

    setDataReloadKey((attempt) => attempt + 1)
  }

  useEffect(() => {
    let active = true

    const loadPublicData = async () => {
      try {
        const publicEstates = await estatesApi.list()

        const publicHouses = await Promise.all(
          publicEstates.map((estate) => housesApi.list(estate.id)),
        )

        if (!active) return

        setEstates(publicEstates)

        setHouses(publicHouses.flat())
      } catch (error) {
        if (active)
          setDataError(
            error instanceof Error
              ? `Unable to load saved estate data: ${error.message}`
              : "Unable to load saved estate data.",
          )
      }
    }

    loadPublicData()

    return () => {
      active = false
    }
  }, [dataReloadKey])

  useEffect(() => {
    localStorage.removeItem("communest_token")

    localStorage.removeItem("communest_role")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)

        setToken(null)
      }

      if (event === "TOKEN_REFRESHED" && session) setToken(session.access_token)
    })

    void supabase.auth

      .signOut({ scope: "local" })

      .then(({ error }) => {
        if (error)
          console.error("Unable to clear the saved sign-in session.", error)
      })

      .catch((error: unknown) => {
        console.error("Unable to clear the saved sign-in session.", error)
      })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const estateId = user?.estateId

    const userRole = user?.role

    if (!token || !estateId || userRole === "regular_user") return

    let active = true

    const loadPrivateData = async () => {
      try {
        const [
          privateEstate,

          privateHouses,

          loadedNotifications,

          loadedMaintenance,

          loadedPayments,

          loadedInquiries,

          loadedProposals,
        ] = await Promise.all([
          estatesApi.get(estateId),

          housesApi.list(estateId),

          notificationsApi.list(token, estateId),

          maintenanceApi.list(token, estateId),

          paymentOptionsApi.list(token, estateId),

          userRole === "estate_admin"
            ? inquiriesApi.list(token, estateId)
            : Promise.resolve([]),

          userRole === "estate_admin"
            ? proposalsApi.list(token, estateId)
            : Promise.resolve([]),
        ])

        if (!active) return

        setEstates((previous) => [
          ...previous.filter((estate) => estate.id !== privateEstate.id),

          privateEstate,
        ])

        setHouses((previous) => [
          ...previous.filter((house) => house.estateId !== estateId),

          ...privateHouses,
        ])

        setNotifications(loadedNotifications)

        setMaintenanceIssues(loadedMaintenance)

        setPaymentOptions(loadedPayments)

        setInquiries(loadedInquiries)

        setProposals(loadedProposals)
      } catch (error) {
        if (active)
          setDataError(
            error instanceof Error
              ? `Unable to load saved estate data: ${error.message}`
              : "Unable to load saved estate data.",
          )
      }
    }

    loadPrivateData()

    return () => {
      active = false
    }
  }, [dataReloadKey, token, user?.estateId, user?.role])

  const loginWithCredentials = async (email: string, password: string) => {
    const { token: jwt, user: dto } = await authApi.login({ email, password })

    setToken(jwt)

    localStorage.setItem("communest_token", jwt)

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
    })
  }

  const registerUser = async (
    name: string,

    email: string,

    phone: string,

    password: string,
  ) => {
    await authApi.register({ name, email, phone, password })
  }

  const logout = async () => {
    if (token) {
      try {
        await authApi.logout(token)
      } catch {
        /* ignore */
      }
    }

    await supabase.auth.signOut()

    setUser(null)

    setToken(null)

    localStorage.removeItem("communest_token")

    localStorage.removeItem("communest_role")
  }

  return (
    <UserContext.Provider
      value={{
        user,

        token,

        setUser,

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

          dataError,

          dataReloadKey,

          setDataError,

          retryData,

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
  )
}

export const useUser = () => useContext(UserContext)

export const useAppData = () => useContext(AppDataContext)
