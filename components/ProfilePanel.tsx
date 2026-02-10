"use client";
import styles from "./profile.module.css";

export default function ProfilePanel({ user }: any) {
  return (
    <div className={styles.profile}>
      <h3 className={styles.title}>Profile</h3>

      <div className={styles.item}>
        <span className={styles.label}>Email:</span>
        <span>{user.email}</span>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>User ID:</span>
        <span>{user.id}</span>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>Last Login:</span>
        <span>{user.last_sign_in_at}</span>
      </div>
    </div>
  );
}
