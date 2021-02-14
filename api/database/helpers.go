package database

import (
	"fmt"
	"log"

	"gorm.io/gorm"
)

// DateComponent a component of a date (day, month, year)
type DateComponent string

const (
	DateCompYear  DateComponent = "YEAR"
	DateCompMonth DateComponent = "MONTH"
	DateCompDay   DateComponent = "DAY"
)

// DateExtract is a helper function that is used to generate the proper SQL syntax
// for extracting date components (day, month, year) for different database backends.
func DateExtract(db *gorm.DB, component DateComponent, attribute string) string {

	var result string

	switch db.Dialector.Name() {
	case "mysql", "postgress":
		result = fmt.Sprintf("EXTRACT(%s FROM %s)", component, attribute)
		break
	case "sqlite":

		var sqliteFormatted string
		switch component {
		case DateCompYear:
			sqliteFormatted = "%Y"
		case DateCompMonth:
			sqliteFormatted = "%m"
		case DateCompDay:
			sqliteFormatted = "%d"
		}

		result = fmt.Sprintf("CAST(strftime('%s', %s) AS INTEGER)", sqliteFormatted, attribute)
		break
	default:
		log.Panicf("unsupported database backend: %s", db.Dialector.Name())
	}

	return result
}
