package servers

import (
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresHandlers"
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresRepositories"
	"github.com/NatthawutSK/real-time-chat/modules/middlewares/middlewaresUsecases"
	"github.com/NatthawutSK/real-time-chat/modules/monitor/monitorHandlers"
	"github.com/gofiber/fiber/v2"
)

type IModuleFactory interface {
	MonitorModule()
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
