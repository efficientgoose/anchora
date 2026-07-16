import type { Metadata } from "next";
import { LoginPage } from "@/features/auth/login-page";

export const metadata: Metadata = { title: "Log In" };

export default function Page() { return <LoginPage />; }
