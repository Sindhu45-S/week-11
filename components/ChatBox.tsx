'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './chat.module.css'


export default function ChatBox() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const BUCKET = process.env.NEXT_PUBLIC_CHAT_BUCKET || "images-chat";

  useEffect(() => {
  fetchMessages();

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setCurrentUserEmail(user.email);
  };
  loadUser();

  const channel = supabase
    .channel("chat-room")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "messages" },
      (payload) => {
        setMessages((prev) =>
          prev.filter((m) => m.id !== payload.old.id)
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) console.error(error)
    if (data) setMessages(data)
  }

  const sendMessage = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let fileUrl = null;
  let fileType = null;

  if (file) {
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      // Better error message when bucket is missing
      if (uploadError.message?.toLowerCase().includes("bucket")) {
        alert(
          `Upload failed: storage bucket "${BUCKET}" not found. Create the bucket in your Supabase dashboard (Storage → New bucket) or set NEXT_PUBLIC_CHAT_BUCKET to an existing bucket name.`
        );
      } else {
        alert(uploadError.message);
      }
      return;
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    fileUrl = data.publicUrl;
    fileType = file.type;
  }

  await supabase.from("messages").insert([
    {
      user_email: user.email,
      content: text,
      file_url: fileUrl,
      file_type: fileType
    }
  ]);

  setText("");
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }
  setFile(null);
};

  const deleteMessage = async (id: number) => {
  await supabase.from("messages").delete().eq("id", id);
};




 return (
  <div className={styles.container}>
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${
              msg.user_email === currentUserEmail ? styles.own : styles.other
            }`}
          >
            <div className={styles.messageAuthor}>
              {msg.user_email}
            </div>

            <div className={styles.messageContent}>
              {msg.content}

              {msg.file_url && msg.file_type?.startsWith("image") && (
                <img
                  src={msg.file_url}
                  className={styles.image}
                  alt="attachment"
                />
              )}

              {msg.file_url && !msg.file_type?.startsWith("image") && (
                <a href={msg.file_url} target="_blank">
                  Download file
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

   
    <div className={styles.inputRow}>
      <button
        className={styles.attachBtn}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        📎
      </button>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          setFile(f);
          if (f) {
            const url = URL.createObjectURL(f);
            setPreviewUrl(url);
          } else {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
          }
        }}
        style={{ display: "none" }}
      />

      {previewUrl && (
        <div className={styles.previewContainer}>
          <img src={previewUrl} className={styles.previewImage} alt="preview" />
          <button
            className={styles.removePreviewBtn}
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              setFile(null);
              const input = document.getElementById("file-input") as HTMLInputElement | null;
              if (input) input.value = "";
            }}
          >
            ✖
          </button>
        </div>
      )}

      <input
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />

      <button
        className={styles.button}
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  </div>
);

}
