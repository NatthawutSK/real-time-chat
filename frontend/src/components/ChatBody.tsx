import { Message } from "@/app/chat/page";
import React from "react";

type Props = {
  data: Message[];
};

function ChatBody({ data }: Props) {
  return (
    <>
      {data.map((message: Message, index: number) => {
        if (message.type == "self") {
          return (
            <div
              className="flex flex-col mt-2 w-full text-right justify-end"
              key={index}
            >
              <div className="text-sm">{message.username}</div>
              <div>
                <div className="bg-blue-600 text-white px-4 py-1 rounded-md inline-block mt-1">
                  {message.content}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="mt-2" key={index}>
              <div className="text-sm">{message.username}</div>
              <div>
                <div className="bg-gray-200 text-dark-secondary px-4 py-1 rounded-md inline-block mt-1">
                  {message.content}
                </div>
              </div>
            </div>
          );
        }
      })}
    </>
  );
}

export default ChatBody;
