package usersUsecases

import (
	"github.com/NatthawutSK/real-time-chat/modules/users"
	"github.com/NatthawutSK/real-time-chat/modules/users/usersRepositories"
)

type IUserUsecase interface {
	DeleteOauth(oauthId string) error
	GetUserProfile(userId string) (*users.User, error)
}

type usersUsecase struct {
	usersRepository usersRepositories.IUserRepository
}

func UserUsecase(usersRepo usersRepositories.IUserRepository) IUserUsecase {
	return &usersUsecase{
		usersRepository: usersRepo,
	}
}

func (u *usersUsecase) DeleteOauth(oauthId string) error {
	if err := u.usersRepository.DeleteOauth(oauthId); err != nil {
		return err
	}
	return nil

}

func (u *usersUsecase) GetUserProfile(userId string) (*users.User, error) {
	profile, err := u.usersRepository.GetProfile(userId)
	if err != nil {
		return nil, err
	}
	return profile, nil

}
