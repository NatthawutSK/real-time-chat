package usersRepositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/NatthawutSK/real-time-chat/modules/users"
	"github.com/jmoiron/sqlx"
)

type IUserRepository interface {
	GetProfile(userId string) (*users.User, error)
	FindOneUserByEmail(email string) (*users.UserCredentialCheck, error)
	InsertUser(req *users.UserRegisterReq) (IUserRepository, error)
	Result() (*users.UserPassport, error)
	InsertOauth(req *users.UserPassport) error
	DeleteOauth(oauthId string) error
}

type usersRepository struct {
	db *sqlx.DB
	id string
}

func UserRepository(db *sqlx.DB) IUserRepository {
	return &usersRepository{
		db: db,
	}
}

// insert user
func (r *usersRepository) InsertUser(req *users.UserRegisterReq) (IUserRepository, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
	INSERT INTO "users" (
		email,
		password,
		username
		)
	VALUES ($1, $2, $3)
	RETURNING "id";
	`
	if err := r.db.QueryRowContext(ctx,
		query,
		req.Email,
		req.Password,
		req.Username,
	).Scan(&r.id); err != nil {
		switch err.Error() {
		case "ERROR: duplicate key value violates unique constraint \"users_username_key\" (SQLSTATE 23505)":
			return nil, fmt.Errorf("username has been used")
		case "ERROR: duplicate key value violates unique constraint \"users_email_key\" (SQLSTATE 23505)":
			return nil, fmt.Errorf("email has been used")
		default:
			return nil, fmt.Errorf("insert user failed: %v", err)
		}
	}
	return r, nil
}

// result from insert user
func (r *usersRepository) Result() (*users.UserPassport, error) {
	query := `
	SELECT
		json_build_object(
			'user', "t",
			'token', NULL
		)
	FROM (
		SELECT
			"u"."id",
			"u"."email",
			"u"."username"
		FROM "users" "u"
		WHERE "u"."id" = $1
	) AS "t"`

	//json_build_object คือ การสร้าง json จากข้อมูลได้

	data := make([]byte, 0)
	if err := r.db.Get(&data, query, r.id); err != nil {
		return nil, fmt.Errorf("get user failed: %v", err)
	}

	user := new(users.UserPassport)
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, fmt.Errorf("unmarshal user failed: %v", err)
	}
	return user, nil
}

func (r *usersRepository) FindOneUserByEmail(email string) (*users.UserCredentialCheck, error) {
	query := `
	SELECT
		"id",
		"email",
		"password",
		"username"
	FROM "users"
	WHERE "email" = $1;`
	user := new(users.UserCredentialCheck)
	if err := r.db.Get(user, query, email); err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

func (r *usersRepository) InsertOauth(req *users.UserPassport) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
	INSERT INTO "oauth" (
		"user_id",
		"access_token"
	)
	VALUES ($1, $2)
		RETURNING "id";`

	if err := r.db.QueryRowContext(
		ctx,
		query,
		req.User.Id,
		req.Token.AccessToken,
	).Scan(&req.Token.Id); err != nil {
		return fmt.Errorf("insert oauth failed: %v", err)
	}
	return nil
}

func (r *usersRepository) GetProfile(userId string) (*users.User, error) {
	query := `
	SELECT
		"id",
		"email",
		"username"
	FROM "users"
	WHERE "id" = $1;`

	profile := new(users.User)
	if err := r.db.Get(profile, query, userId); err != nil {
		return nil, fmt.Errorf("get user failed: %v", err)
	}
	return profile, nil
}

func (r *usersRepository) DeleteOauth(oauthId string) error {
	query := `
	DELETE FROM "oauth"
	WHERE "id" = $1;`

	if _, err := r.db.ExecContext(context.Background(), query, oauthId); err != nil {
		return fmt.Errorf("oauth not found")
	}
	return nil
}
