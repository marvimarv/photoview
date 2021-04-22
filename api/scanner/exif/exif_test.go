package exif

import (
	"fmt"
	"path"
	"testing"
	"time"

	"github.com/barasher/go-exiftool"
	"github.com/photoview/photoview/api/graphql/models"
	"github.com/stretchr/testify/assert"
)

func TestExifParsers(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test")
	}

	parsers := []struct {
		name   string
		parser exifParser
	}{
		{
			name:   "internal",
			parser: &internalExifParser{},
		},
		{
			name:   "external",
			parser: &externalExifParser{},
		},
	}

	images := []struct {
		path   string
		assert func(t *testing.T, exif *models.MediaEXIF)
	}{
		{
			path: "./test_data/bird.jpg",
			assert: func(t *testing.T, exif *models.MediaEXIF) {
				assert.WithinDuration(t, *exif.DateShot, time.Unix(1336318784, 0).UTC(), time.Minute)
				assert.EqualValues(t, *exif.Camera, "Canon EOS 600D")
				assert.EqualValues(t, *exif.Maker, "Canon")
				assert.WithinDuration(t, *exif.DateShot, time.Unix(1336318784, 0).UTC(), time.Minute)
				assert.EqualValues(t, *exif.Aperture, 6.3)
				assert.EqualValues(t, *exif.Iso, 800)
				assert.EqualValues(t, *exif.FocalLength, 300)
				assert.EqualValues(t, *exif.Flash, 16)
				assert.EqualValues(t, *exif.Orientation, 1)
				assert.InDelta(t, *exif.GPSLatitude, 65.01681388888889, 0.0001)
				assert.InDelta(t, *exif.GPSLongitude, 25.466863888888888, 0.0001)
			},
		},
		{
			path: "./test_data/stripped.jpg",
			assert: func(t *testing.T, exif *models.MediaEXIF) {
				assert.Nil(t, exif)
			},
		},
	}

	for _, p := range parsers {
		for _, img := range images {
			t.Run(fmt.Sprintf("%s:%s", p.name, path.Base(img.path)), func(t *testing.T) {

				if p.name == "external" {
					_, err := exiftool.NewExiftool()
					if err != nil {
						t.Skip("failed to get exiftool, skipping test")
					}
				}

				exif, err := p.parser.ParseExif(img.path)

				if assert.NoError(t, err) {
					img.assert(t, exif)
				}
			})
		}
	}
}

// func TestExternalExifParser(t *testing.T) {
// 	parser := externalExifParser{}

// 	exif, err := parser.ParseExif((bird_path))

// 	if assert.NoError(t, err) {
// 		assert.Equal(t, exif, &bird_exif)
// 	}
// }
