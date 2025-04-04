import { Restaurant } from "./restaurant";

export interface RestaurantsResponse {
  restaurants: Restaurant[];
}

export interface SingleRestaurantResponse {
  restaurant: Restaurant;
}
