package servers

import (
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresHandlers"
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresRepositories"
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresUsecases"
	"github.com/NatthawutSK/real-time-chat/modules/monitor/monitorHandlers"
	"github.com/NatthawutSK/real-time-chat/modules/users/usersHandlers"
	"github.com/NatthawutSK/real-time-chat/modules/users/usersRepositories"
	"github.com/NatthawutSK/real-time-chat/modules/users/usersUsecases"
	"github.com/NatthawutSK/real-time-chat/modules/webSocket"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

type IModuleFactory interface {
	MonitorModule()
	UsersModule()
	WebSocketModule(hub *webSocket.Hub)
}

type moduleFactory struct {
	r   fiber.Router
	s   *server
	mid middlewaresHandlers.IMiddlewaresHandler
}

func InitModule(r fiber.Router, s *server, mid middlewaresHandlers.IMiddlewaresHandler) IModuleFactory {
	return &moduleFactory{
		r:   r,
		s:   s,
		mid: mid,
	}
}

func (m *moduleFactory) MonitorModule() {
	handle := monitorHandlers.MonitorHandler(m.s.cfg)
	m.r.Get("/", handle.HealthCheck)
}

func InitMiddlewares(s *server) middlewaresHandlers.IMiddlewaresHandler {
	repository := middlewaresRepositories.MiddlewaresRepository(s.db)
	usecase := middlewaresUsecases.MiddlewaresUsecase(repository)
	return middlewaresHandlers.MiddlewaresHandler(s.cfg, usecase)
}

func (m *moduleFactory) UsersModule() {
	repository := usersRepositories.UserRepository(m.s.db)
	usecase := usersUsecases.UserUsecase(repository, m.s.cfg)
	handler := usersHandlers.UsersHandler(usecase, m.s.cfg)

	router := m.r.Group("/users")

	router.Post("/signup", handler.SignUp)
	router.Post("/signin", handler.SignIn)
	router.Post("/signout", handler.SignOut)
	router.Get("/:user_id", m.mid.JwtAuth(), m.mid.ParamsCheck(), handler.GetUserProfile)
}

func (m *moduleFactory) WebSocketModule(hub *webSocket.Hub) {
	weHandler := webSocket.NewHandler(hub)
	router := m.r.Group("/ws")
	router.Post("/createRoom", weHandler.CreateRoom)
	router.Get("/getRooms", weHandler.GetRooms)
	router.Get("/getClients/:roomId", weHandler.GetClients)
	router.Get("/join-room/:roomId", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}, websocket.New(weHandler.JoinRoom))
}

//
