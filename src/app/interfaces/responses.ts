import { Comment } from "./comment";
import { Restaurant } from "./restaurant";
import { User } from "./user";

export interface RestaurantsResponse {
    restaurants: Restaurant[];
    count: number;
    page: number;
    more: boolean;
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

