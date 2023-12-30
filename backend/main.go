package main

import (
	"os"

	"github.com/NatthawutSK/real-time-chat/config"
	"github.com/NatthawutSK/real-time-chat/modules/servers"
	"github.com/NatthawutSK/real-time-chat/pkg/databases"
)

func envPath() string {
	if len(os.Args) == 1 {
		return ".env"
	} else {
		return os.Args[1]
	}
}

func main() {
	cfg := config.LoadConfig(envPath())

	// fmt.Println(cfg)

	db := databases.DbConnect(cfg.Db())
	defer db.Close()

	servers.NewSever(cfg, db).Start()
}
