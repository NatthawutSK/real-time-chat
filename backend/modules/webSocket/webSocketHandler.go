package webSocket

import (
	"github.com/NatthawutSK/real-time-chat/modules/entities"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type webSockerHandlerErrorCode string

const (
	createRoomErr webSockerHandlerErrorCode = "ws-001"
	joinRoomErr   webSockerHandlerErrorCode = "ws-002"
)

type IHandler interface {
	CreateRoom(c *fiber.Ctx) error
	JoinRoom(c *websocket.Conn)
	GetRooms(c *fiber.Ctx) error
	GetClients(c *fiber.Ctx) error
}

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) IHandler {
	return &Handler{
		hub: h,
	}
}

type CreateRoomReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) CreateRoom(c *fiber.Ctx) error {
	req := new(CreateRoomReq)
	if err := c.BodyParser(req); err != nil {
		return entities.NewResponse(c).Error(
			fiber.StatusBadRequest,
			string(createRoomErr),
			err.Error(),
		).Res()
	}

	h.hub.Rooms[req.ID] = &Room{
		ID:      req.ID,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	return entities.NewResponse(c).Success(fiber.StatusOK, req).Res()
}

// var upgrader = websocket.Upgrader{
// 	ReadBufferSize:  1024,
// 	WriteBufferSize: 1024,
// 	CheckOrigin: func(r *http.Request) bool {
// 		return true
// 	},
// }

// func (h *Handler) initGrader() (*websocket.Conn, error) {
// 	conn, err := upgrader.Upgrade(h.w, h.r, nil)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return conn, nil
// }

func (h *Handler) JoinRoom(c *websocket.Conn) {
	// conn, err := h.initGrader()
	// conn, err := websocket.Upgrader(c, c.Response(), c.Request())
	// conn, err := upgrader.Upgrade(c.Context(), c.Response(), c.Request(), nil)
	// if err != nil {
	// 	return entities.NewResponse(c).Error(
	// 		fiber.StatusBadRequest,
	// 		string(joinRoomErr),
	// 		err.Error(),
	// 	).Res()
	// }

	roomID := c.Params("roomId")
	clientID := c.Query("userId")
	username := c.Query("username")

	cl := &Client{
		Conn:     c,
		Message:  make(chan *Message, 10),
		ID:       clientID,
		RoomID:   roomID,
		Username: username,
	}

	m := &Message{
		Content:  "A new user has joined the room",
		RoomID:   roomID,
		Username: username,
	}

	// Register new client through the register channel
	h.hub.Register <- cl
	// boardcast message to all clients in the room
	h.hub.Broadcast <- m

	// writeMessage()
	go cl.writeMessage()
	// readMessage()
	cl.readMessage(h.hub)

}

type RoomRes struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) GetRooms(c *fiber.Ctx) error {
	rooms := make([]RoomRes, 0)

	for _, r := range h.hub.Rooms {
		rooms = append(rooms, RoomRes{
			ID:   r.ID,
			Name: r.Name,
		})
	}

	return entities.NewResponse(c).Success(fiber.StatusOK, rooms).Res()
}

type ClientRes struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

func (h *Handler) GetClients(c *fiber.Ctx) error {
	var clients []*ClientRes
	roomId := c.Params("roomId")

	if _, ok := h.hub.Rooms[roomId]; !ok {
		clients = make([]*ClientRes, 0)
		return entities.NewResponse(c).Success(fiber.StatusOK, clients).Res()
	}

	for _, c := range h.hub.Rooms[roomId].Clients {
		clients = append(clients, &ClientRes{
			ID:       c.ID,
			Username: c.Username,
		})
	}

	return entities.NewResponse(c).Success(fiber.StatusOK, clients).Res()
}
