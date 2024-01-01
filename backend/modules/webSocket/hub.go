package webSocket

type Room struct {
	ID      string             `json:"id"`
	Name    string             `json:"name"`
	Clients map[string]*Client `json:"clients"`
}

type Hub struct {
	Rooms      map[string]*Room
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]*Room),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message, 5),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case cl := <-h.Register:
			// Check if room exists
			if _, ok := h.Rooms[cl.RoomID]; ok {
				r := h.Rooms[cl.RoomID]
				// Check if client not already exists in room then add client to room
				if _, ok := r.Clients[cl.ID]; !ok {
					r.Clients[cl.ID] = cl
				}
			}
		case cl := <-h.Unregister:
			// Check if room exists
			if _, ok := h.Rooms[cl.RoomID]; ok {
				// Check if client exists in room then delete client from room
				if _, ok := h.Rooms[cl.RoomID].Clients[cl.ID]; ok {
					// Check if room still has clients then broadcast message "user left the chat"
					if len(h.Rooms[cl.RoomID].Clients) != 0 {
						h.Broadcast <- &Message{
							Content:  "user left the chat",
							RoomID:   cl.RoomID,
							Username: cl.Username,
						}
					}

					// Delete client from room
					delete(h.Rooms[cl.RoomID].Clients, cl.ID)
					// Close message channel of client
					close(cl.Message)
				}
			}
		case m := <-h.Broadcast:
			// Check if room exists
			if _, ok := h.Rooms[m.RoomID]; ok {
				// Send message to all clients in the room
				for _, cl := range h.Rooms[m.RoomID].Clients {
					cl.Message <- m
				}
			}
		}
	}
}
