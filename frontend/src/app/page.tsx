"use client";
import React, { useEffect, useState } from "react";
import LogoutButton from "@/components/Logout";
import WithAuth from "@/components/WithAuth";
import WithoutAuth from "@/components/WithoutAuth";
import { useAuthContext } from "@/provider/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL, WEBSOCKET_URL } from "@/constants";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useWsContext } from "@/provider/WebSocketProvider";
import { useRouter } from "next/navigation";
type Props = {};

function Home({}: Props) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [roomName, setRoomName] = useState("");
  const { user }: any = useAuthContext();
  const { setConn }: any = useWsContext();
  const { toast: showToast } = useToast();
  const router = useRouter();

  const getRooms = async () => {
    try {
      const response = await fetch(API_URL + "/ws/getRooms", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
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
        setRooms(data);
      }

      console.log(data);
    } catch (error) {
      console.error(error);
      showToast({
        description: "Something went wrong!",
        variant: "destructive",
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    try {
      setRoomName("");
      const response = await fetch(`${API_URL}/ws/createRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: uuidv4(),
          name: roomName,
        }),
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
        getRooms();
      }
    } catch (err) {
      console.log(err);
      showToast({
        description: "Something went wrong!",
        variant: "destructive",
        duration: 1500,
      });
    }
  };

  const joinRoom = (roomId: string) => {
    const ws = new WebSocket(
      `${WEBSOCKET_URL}/ws/join-room/${roomId}?userId=${user.id}&username=${user.username}`
    );
    console.log(roomId);

    if (ws.OPEN) {
      setConn(ws);
      router.push("/chat");
      return;
    }
  };

  return (
    <>
      <div className="fixed top-0 right-0 p-2">
        <LogoutButton />
      </div>
      <div className="my-10 px-8  w-full h-full pt-5">
        <div className="flex justify-center items-center">
          <Input
            className="border border-black rounded-md p-2 w-full md:w-1/2 lg:w-1/3 "
            placeholder="Room Name..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button
            className="border border-black rounded-md p-2 w-32 ml-2"
            onClick={submitHandler}
          >
            Create Room
          </Button>
        </div>
        <div className="mt-6">
          <div className="font-bold text-xl">Available Rooms</div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="border border-blue p-4 flex items-center rounded-md w-full"
              >
                <div className="w-full">
                  <div className="text-sm">room</div>
                  <div className="text-blue font-bold text-lg">{room.name}</div>
                </div>
                <div className="">
                  <Button
                    className="border border-black rounded-md p-2 w-12 ml-2 text-xs"
                    onClick={() => joinRoom(room.id)}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default WithAuth(Home);
