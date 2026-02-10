"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import ChatBox from "@/components/ChatBox";
import MembersList from "@/components/MembersList";
import ProfilePanel from "@/components/ProfilePanel";

import styles from "./dashboard.module.css";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/");
      else setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      {/* Top Navbar */}
      <div className={styles.header}>
        <div className={styles.brand}>💬 SupaChat</div>

        <div className={styles.right}>
          <span className={styles.email}>{user.email}</span>

          <button
            className={styles.profileBtn}
            onClick={() => setShowProfile(!showProfile)}
          >
            Profile
          </button>

          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.main}>
        <MembersList />
        <ChatBox />
        {showProfile && <ProfilePanel user={user} />}
      </div>
    </div>
  );
}
