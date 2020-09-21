package scanner

import (
	"database/sql"
	"log"
	"sync"
	"time"
)

type periodicScanner struct {
	ticker         *time.Ticker
	ticker_changed chan bool
	mutex          *sync.Mutex
	db             *sql.DB
}

var mainPeriodicScanner *periodicScanner = nil

func getPeriodicScanInterval(db *sql.DB) (time.Duration, error) {
	row := db.QueryRow("SELECT periodic_scan_interval FROM site_info")
	var intervalSeconds int

	if err := row.Scan(&intervalSeconds); err != nil {
		return 0, err
	}

	return time.Duration(intervalSeconds) * time.Second, nil
}

func InitializePeriodicScanner(db *sql.DB) error {
	if mainPeriodicScanner != nil {
		panic("periodic scanner has already been initialized")
	}

	scanInterval, err := getPeriodicScanInterval(db)
	if err != nil {
		return err
	}

	mainPeriodicScanner = &periodicScanner{
		db:             db,
		ticker_changed: make(chan bool),
		mutex:          &sync.Mutex{},
	}

	go scanIntervalRunner()

	ChangePeriodicScanInterval(scanInterval)
	return nil
}

func ChangePeriodicScanInterval(duration time.Duration) {
	var new_ticker *time.Ticker = nil
	if duration > 0 {
		new_ticker = time.NewTicker(duration)
		log.Printf("Periodic scan interval changed: %s", duration.String())
	} else {
		log.Print("Periodic scan interval changed: disabled")
	}

	{
		mainPeriodicScanner.mutex.Lock()
		defer mainPeriodicScanner.mutex.Unlock()

		if mainPeriodicScanner.ticker != nil {
			mainPeriodicScanner.ticker.Stop()
		}

		mainPeriodicScanner.ticker = new_ticker
		mainPeriodicScanner.ticker_changed <- true
	}
}

func scanIntervalRunner() {
	for {
		log.Print("Scan interval runner: Waiting for signal")
		if mainPeriodicScanner.ticker != nil {
			select {
			case <-mainPeriodicScanner.ticker_changed:
				log.Print("Scan interval runner: New ticker detected")
			case <-mainPeriodicScanner.ticker.C:
				log.Print("Scan interval runner: Starting periodic scan")
				AddAllToQueue()
			}
		} else {
			<-mainPeriodicScanner.ticker_changed
			log.Print("Scan interval runner: New ticker detected")
		}
	}
}
