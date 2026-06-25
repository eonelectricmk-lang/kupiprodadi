export class SearchService {
  provider = 'elasticsearch-like';

  buildQuery(input: { query?: string; minPrice?: number; maxPrice?: number }) {
    return {
      text: input.query ?? '',
      range: {
        gte: input.minPrice,
        lte: input.maxPrice,
      },
    };
  }
}
