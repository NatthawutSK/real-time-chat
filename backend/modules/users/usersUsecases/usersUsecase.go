package usersUsecases

import (
	"fmt"

	"github.com/NatthawutSK/real-time-chat/config"
	"github.com/NatthawutSK/real-time-chat/modules/users"
	"github.com/NatthawutSK/real-time-chat/modules/users/usersRepositories"
	"github.com/NatthawutSK/real-time-chat/pkg/auth"
	"golang.org/x/crypto/bcrypt"
)

type IUserUsecase interface {
	DeleteOauth(oauthId string) error
	GetUserProfile(userId string) (*users.User, error)
	InsertUser(req *users.UserRegisterReq) (*users.UserPassport, error)
	GetPassport(req *users.UserCredential) (*users.UserPassport, error)
}

type usersUsecase struct {
	cfg             config.IConfig
	usersRepository usersRepositories.IUserRepository
}

func UserUsecase(usersRepo usersRepositories.IUserRepository, cfg config.IConfig) IUserUsecase {
	return &usersUsecase{
		usersRepository: usersRepo,
		cfg:             cfg,
	}
}

// use for register user
func (u *usersUsecase) InsertUser(req *users.UserRegisterReq) (*users.UserPassport, error) {
	//hashing password
	if err := req.BcryptHashing(); err != nil {
		return nil, err
	}
	//insert user
	result, err := u.usersRepository.InsertUser(req)
	if err != nil {
		return nil, err
	}
	res, err := result.Result()
	if err != nil {
		return nil, err
	}

	return res, nil
}

// use for login to get token and user information
func (u *usersUsecase) GetPassport(req *users.UserCredential) (*users.UserPassport, error) {
	user, err := u.usersRepository.FindOneUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	// compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// sign token
	accessToken, err1 := auth.NewRiAuth(auth.Access, u.cfg.Jwt(), &users.UserClaims{
		Id: user.Id,
	})
	if err1 != nil {
		return nil, err
	}

	// set passport
	passport := &users.UserPassport{
		User: &users.User{
			Id:       user.Id,
			Email:    user.Email,
			Username: user.Username,
		},
		Token: &users.UserToken{
			AccessToken: accessToken.SignToken(),
		},
	}

	if err := u.usersRepository.InsertOauth(passport); err != nil {
		return nil, err
	}
	return passport, nil

}

// use for logout
func (u *usersUsecase) DeleteOauth(oauthId string) error {
	if err := u.usersRepository.DeleteOauth(oauthId); err != nil {
		return err
	}
	return nil

}

// use for get user profile
func (u *usersUsecase) GetUserProfile(userId string) (*users.User, error) {
	profile, err := u.usersRepository.GetProfile(userId)
	if err != nil {
		return nil, err
	}
	return profile, nil

}
