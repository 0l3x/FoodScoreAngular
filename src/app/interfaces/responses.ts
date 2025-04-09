import { Comment } from "./comment";
import { Restaurant } from "./restaurant";
import { User } from "./user";

export interface RestaurantsResponse {
    restaurants: Restaurant[];
    more: boolean;
    page: number;
    count: number;
}

export interface SingleRestaurantResponse {
    restaurant: Restaurant;
}

export interface TokenResponse {
    accessToken: string;
}

export interface SingleUserResponse {
    user: User;
}

export interface AvatarResponse {
    avatar: string;
}

export interface CommentsResponse {
    comments: Comment[];
}

export interface SingleCommentResponse {
    comment: Comment;
}

