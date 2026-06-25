type SearchQuery = {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function searchAds(params: SearchQuery) {
  // Endpoint shape: GET /ads?query=iphone&minPrice=100&maxPrice=500
  return {
    endpoint: '/ads',
    filters: {
      query: params.query,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    },
    engine: 'Elastic-style search',
  };
}
