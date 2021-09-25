package resolvers

import (
	"context"
	"time"

	"github.com/photoview/photoview/api/graphql/auth"
	"github.com/photoview/photoview/api/graphql/models"
)

func (r *queryResolver) MyTimeline(ctx context.Context, paginate *models.Pagination, onlyFavorites *bool, fromDate *time.Time) ([]*models.Media, error) {
	user := auth.UserFromContext(ctx)
	if user == nil {
		return nil, auth.ErrUnauthorized
	}

	query := r.Database.
		Joins("JOIN albums ON media.album_id = albums.id").
		Where("albums.id IN (?)", r.Database.Table("user_albums").Select("user_albums.album_id").Where("user_id = ?", user.ID)).
		Order("YEAR(media.date_shot) DESC").
		Order("MONTH(media.date_shot) DESC").
		Order("DAY(media.date_shot) DESC").
		Order("albums.title ASC")

	if fromDate != nil {
		query = query.Where("media.date_shot < ?", fromDate)
	}

	if onlyFavorites != nil && *onlyFavorites == true {
		query = query.Where("media.id IN (?)", r.Database.Table("user_media_data").Select("user_media_data.media_id").Where("user_media_data.user_id = ?", user.ID).Where("user_media_data.favorite = 1"))
	}

	query = models.FormatSQL(query, nil, paginate)

	var media []*models.Media
	if err := query.Find(&media).Error; err != nil {
		return nil, err
	}

	return media, nil
}
