import burger from "@/assets/burger.jpg";
import cocktail from "@/assets/cocktail.jpg";
import coffee from "@/assets/coffee.jpg";
import couple from "@/assets/couple.jpg";
import decor from "@/assets/decor.jpg";
import dessert from "@/assets/dessert.jpg";
import drinks from "@/assets/drinks.jpg";
import family from "@/assets/family.jpg";
import icecream from "@/assets/icecream.jpg";
import lounge from "@/assets/lounge.jpg";
import mainDish from "@/assets/main-dish.jpg";
import pasta from "@/assets/pasta.jpg";
import pizza from "@/assets/pizza.jpg";
import salad from "@/assets/salad.jpg";
import student from "@/assets/student.jpg";
import sunset from "@/assets/sunset.jpg";
import terrace from "@/assets/terrace.jpg";

const localImages: Record<string, string> = {
  burger,
  cocktail,
  coffee,
  couple,
  decor,
  dessert,
  drinks,
  family,
  icecream,
  lounge,
  "main-dish": mainDish,
  main: mainDish,
  pasta,
  pizza,
  salad,
  student,
  sunset,
  terrace,
};

export function resolveImage(imgSrc: string): string {
  if (!imgSrc) return coffee;
  if (imgSrc.startsWith("http://") || imgSrc.startsWith("https://") || imgSrc.startsWith("data:")) {
    return imgSrc;
  }
  // Remove file extension and folder prefixes if any
  const cleanName = imgSrc.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
  return localImages[cleanName] || localImages[imgSrc] || coffee;
}
