import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface UseFavoritesResult {
  favorites: string[];
  toggleFavorite: (pair: string) => void;
}

export default function useFavorites(
  defaultSecondAsset: string
): UseFavoritesResult {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = Cookies.get("favorites");
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error("Error parsing favorites:", error);
      }
    }
  }, []);

  useEffect(() => {
    Cookies.set("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (pair: string) => {
    if (favorites.includes(pair)) {
      setFavorites(favorites.filter((fav) => fav !== pair));
    } else {
      const [firstAsset, secondAsset] = pair.split("/");
      const formattedPair = `${firstAsset}/${
        secondAsset || defaultSecondAsset
      }`;
      setFavorites([...favorites, formattedPair]);
    }
  };

  return { favorites, toggleFavorite };
}
