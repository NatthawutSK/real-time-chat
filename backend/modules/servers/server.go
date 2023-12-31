package servers

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"

	"github.com/NatthawutSK/real-time-chat/config"
	"github.com/NatthawutSK/real-time-chat/modules/webSocket"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

type IServer interface {
	GetServer() *server
	Start()
}

type server struct {
	app *fiber.App
	cfg config.IConfig
	db  *sqlx.DB
}

func NewSever(cfg config.IConfig, db *sqlx.DB) IServer {
	return &server{
		cfg: cfg,
		db:  db,
		app: fiber.New(fiber.Config{
			AppName:      cfg.App().Name(),
			BodyLimit:    cfg.App().BodyLimit(),
			ReadTimeout:  cfg.App().ReadTimeout(),
			WriteTimeout: cfg.App().WriteTimeout(),
			JSONEncoder:  json.Marshal,
			JSONDecoder:  json.Unmarshal,
		}),
	}

}

func (s *server) Start() {
	//init hub
	hub := webSocket.NewHub()

	//middleware
	middleware := InitMiddlewares(s)
	s.app.Use(middleware.Cors())
	s.app.Use(middleware.Logger())
	// other middleware

	// module
	v1 := s.app.Group("/v1")
	modules := InitModule(v1, s, middleware)

	modules.MonitorModule()
	modules.UsersModule()
	modules.WebSocketModule(hub)
	//other module

	// if route not found
	s.app.Use(middleware.RouterCheck())

	//run hub
	go hub.Run()

	//Graceful shutdown
	//if have something interupt, it will shutdown server
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		log.Println("server is shutting down...")
		_ = s.app.Shutdown()
	}()

	//Listen to host:port
	log.Printf("server is running at %v", s.cfg.App().Url())
	s.app.Listen(s.cfg.App().Url())
}

func (s *server) GetServer() *server {
	return s
}
