import differenceBy from 'lodash/differenceBy'
import { TopSellerGenreInterface } from './interface/top-seller-genre.interface'

export class BooksStockUtils {
  static getTopSellerGenre(
    EGenres: object,
    userOrders: TopSellerGenreInterface[],
  ) {
    const genres: TopSellerGenreInterface[] = Object.values(EGenres).map(
      (genre) => ({
        genre: genre,
        topSeller: [],
      }),
    )

    return differenceBy(genres, userOrders, 'genre').concat(userOrders)
  }
}
