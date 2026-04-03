"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session?.role === "customer") router.replace("/customer/search");
    else if (session?.role === "employee") router.replace("/employee/checkin");
    else router.replace("/login");
  }, [session, router]);

  // Render nothing while redirecting
  return null;
}
