package entity

import "time"

type User struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null;size:255" json:"email"`
	Password  string    `gorm:"column:password_hash;not null;size:255" json:"password"`
	FullName  string    `gorm:"column:full_name;not null;size:255" json:"full_name"`
	Role      string    `gorm:"not null;size:20;check:role IN ('student', 'teacher', 'admin')" json:"role"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
