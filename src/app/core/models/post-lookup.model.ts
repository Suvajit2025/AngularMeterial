// API model for the SOPPostList endpoint.
// The backend endpoint name is SOPPostList, but the business lookup is Post.
export interface PostLookupApi {
  IDPost: number;
  Name: string;
}

// UI option model used by reusable PrimeNG post picker components.
export interface PostLookupOption {
  postId: number;
  name: string;
}
