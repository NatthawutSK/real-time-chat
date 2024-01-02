"use client";
import ChatBody from "@/components/ChatBody";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from "@/constants";
import { useWsContext } from "@/provider/WebSocketProvider";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import autosize from "autosize";
import { useAuthContext } from "@/provider/AuthProvider";
type Props = {};

export type Message = {
  content: string;
  client_id: string;
  username: string;
  room_id: string;
  type: "recv" | "self";
};

function Chat({}: Props) {
  const { user }: any = useAuthContext();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const { toast: showToast } = useToast();
  const [users, setUsers] = useState<Array<{ username: string }>>([]);
  const [messages, setMessage] = useState<Message[]>([]);
  const { conn }: any = useWsContext();
  const router = useRouter();

  useEffect(() => {
    if (conn === null) {
      router.push("/");
      return;
    }

    const startIndex = conn.url.lastIndexOf("/") + 1; // Index after the last '/'
    const endIndex = conn.url.indexOf("?"); // Index of '?'

    const roomId = conn.url.substring(startIndex, endIndex);

    async function getUsers() {
      try {
        const response = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (response.status >= 400 && response.status < 600) {
          showToast({
            description: data.message,
            variant: "destructive",
            duration: 1500,
          });
        }
        if (response.status === 200) {
          setUsers(data);
        }
      } catch (e) {
        console.error(e);
        showToast({
          description: "Something went wrong!",
          variant: "destructive",
          duration: 1500,
        });
      }
    }
    getUsers();
  }, []);

  useEffect(() => {
    // autosize textarea
    if (textarea.current) {
      autosize(textarea.current);
    }

    // check connection
    if (conn === null) {
      router.push("/");
      return;
    }

    conn.onmessage = (message: any) => {
      const m: Message = JSON.parse(message.data);
      // check if new user joined then add to users
      if (m.content == "A new user has joined the room") {
        setUsers([...users, { username: m.username }]);
      }

      // check if user left then remove from users
      if (m.content == "user left the chat") {
        const deleteUser = users.filter((user) => user.username != m.username);
        setUsers([...deleteUser]);
        setMessage([...messages, m]);
        return;
      }

      // check message is from urself or recieve
      user?.username == m.username ? (m.type = "self") : (m.type = "recv");
      // add message to messages
      setMessage([...messages, m]);
    };

    conn.onclose = () => {};
    conn.onerror = () => {};
    conn.onopen = () => {};
  }, [textarea, messages, conn, users]);

  function sendMessage() {
    if (!textarea.current?.value) return;
    // check connection
    if (conn === null) {
      router.push("/");
      return;
    }

    conn.send(textarea.current.value);
    textarea.current.value = "";
  }

  const handleExitRoom = () => {
    if (conn) {
      conn.close(); // Close the WebSocket connection
    }
    router.push("/");
    // Perform additional cleanup or navigation logic if needed
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-2 md:mx-6 mb-24">
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex justify-center">
            <Button className="" onClick={handleExitRoom}>
              Exit
            </Button>
          </div>
        </div>
        <ChatBody data={messages} />
        {/* <h1>{JSON.stringify(users)}</h1> */}
      </div>
      <div className="fixed bottom-0 mt-4  w-full bg-white">
        <div className="flex md:flex-row px-4 py-2 bg-grey md:mx-4 rounded-md items-center">
          <div className="flex w-full mr-4 rounded-md border border-blue">
            <Textarea
              ref={textarea}
              placeholder="type your message here"
              className="w-full  p-2 rounded-md border-black border "
              style={{ resize: "none" }}
              onKeyDown={handleKeyPress}
            />
          </div>
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
