"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./members.module.css";

export default function MembersList() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("messages")
        .select("user_email")
        .order("created_at");

      const unique = Array.from(
        new Set(data?.map((u) => u.user_email))
      ).map(email => ({ email }));

      setUsers(unique);
    };

    loadUsers();
  }, []);

  return (
    <div className={styles.sidebar}>
      <h3>Members</h3>
      {users.map((u) => (
        <div key={u.email} className={styles.member}>
          👤 {u.email}
        </div>
      ))}
    </div>
  );
}
