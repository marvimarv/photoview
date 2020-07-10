package models

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/pkg/errors"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	UserID   int
	Username string
	Password *string
	RootPath string
	Admin    bool
}

func (u *User) ID() int {
	return u.UserID
}

type AccessToken struct {
	Value  string
	Expire time.Time
}

var ErrorInvalidUserCredentials = errors.New("invalid credentials")

func NewUserFromRow(row *sql.Row) (*User, error) {
	user := User{}

	if err := row.Scan(&user.UserID, &user.Username, &user.Password, &user.RootPath, &user.Admin); err != nil {
		return nil, errors.Wrap(err, "failed to scan user from database")
	}

	return &user, nil
}

func NewUsersFromRows(rows *sql.Rows) ([]*User, error) {
	users := make([]*User, 0)

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.UserID, &user.Username, &user.Password, &user.RootPath, &user.Admin); err != nil {
			return nil, errors.Wrap(err, "failed to scan users from database")
		}
		users = append(users, &user)
	}

	rows.Close()

	return users, nil
}

func AuthorizeUser(database *sql.DB, username string, password string) (*User, error) {
	row := database.QueryRow("SELECT * FROM user WHERE username = ?", username)

	user, err := NewUserFromRow(row)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrorInvalidUserCredentials
		} else {
			return nil, err
		}
	}

	if user.Password == nil {
		return nil, errors.New("user does not have a password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return nil, ErrorInvalidUserCredentials
		} else {
			return nil, errors.Wrap(err, "compare user password hash")
		}
	}

	return user, nil
}

var ErrorInvalidRootPath = errors.New("invalid root path")

func ValidRootPath(rootPath string) bool {
	_, err := os.Stat(rootPath)
	if err != nil {
		log.Printf("Warn: invalid root path: '%s'\n%s\n", rootPath, err)
		return false
	}

	return true
}

func RegisterUser(database *sql.Tx, username string, password *string, rootPath string, admin bool) (*User, error) {
	if !ValidRootPath(rootPath) {
		return nil, ErrorInvalidRootPath
	}

	if password != nil {
		hashedPassBytes, err := bcrypt.GenerateFromPassword([]byte(*password), 12)
		if err != nil {
			return nil, errors.Wrap(err, "failed to hash password")
		}
		hashedPass := string(hashedPassBytes)

		if _, err := database.Exec("INSERT INTO user (username, password, root_path, admin) VALUES (?, ?, ?, ?)", username, hashedPass, rootPath, admin); err != nil {
			return nil, errors.Wrap(err, "insert new user with password into database")
		}
	} else {
		if _, err := database.Exec("INSERT INTO user (username, root_path, admin) VALUES (?, ?, ?)", username, rootPath, admin); err != nil {
			return nil, errors.Wrap(err, "insert user without password into database")
		}
	}

	row := database.QueryRow("SELECT * FROM user WHERE username = ?", username)
	if row == nil {
		return nil, ErrorInvalidUserCredentials
	}

	user, err := NewUserFromRow(row)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (user *User) GenerateAccessToken(database *sql.Tx) (*AccessToken, error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return nil, errors.New(fmt.Sprintf("Could not generate token: %s\n", err.Error()))
	}
	const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	for i, b := range bytes {
		bytes[i] = CHARACTERS[b%byte(len(CHARACTERS))]
	}

	token_value := string(bytes)
	expire := time.Now().Add(14 * 24 * time.Hour)
	expireString := expire.UTC().Format("2006-01-02 15:04:05")

	if _, err := database.Exec("INSERT INTO access_token (value, expire, user_id) VALUES (?, ?, ?)", token_value, expireString, user.UserID); err != nil {
		return nil, err
	}

	token := AccessToken{
		Value:  token_value,
		Expire: expire,
	}

	return &token, nil
}

func VerifyTokenAndGetUser(database *sql.DB, token string) (*User, error) {

	now := time.Now().UTC().Format("2006-01-02 15:04:05")

	row := database.QueryRow("SELECT (user_id) FROM access_token WHERE expire > ? AND value = ?", now, token)

	var userId string

	if err := row.Scan(&userId); err != nil {
		log.Println(err.Error())
		return nil, err
	}

	row = database.QueryRow("SELECT * FROM user WHERE user_id = ?", userId)
	user, err := NewUserFromRow(row)
	if err != nil {
		return nil, err
	}

	return user, nil
}
