import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { Sun, Cloud, CloudRain, Wind, Thermometer, MapPin, Coffee, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

// Translations for weather conditions and suggestions
const weatherTranslations: Record<string, Record<string, string>> = {
  fr: {
    title: "Le Climat à Djerba",
    sub: "Houmt Souk",
    loading: "Consultation de la météo djerbienne...",
    temp: "Température",
    wind: "Vent",
    error: "Météo indisponible",
    
    // Recommendations
    rec_inside: "🌿 Notre suggestion : Installez-vous dans notre salon intérieur climatisé pour un confort optimal.",
    rec_terrace: "🌺 Notre suggestion : Profitez de la brise naturelle sur notre magnifique Terrasse Jardin !",
    rec_windy: "💨 Notre suggestion : La brise de Djerba souffle aujourd'hui. Installez-vous à l'abri sur la terrasse abritée ou dans le salon.",
    rec_rainy: "🌧️ Notre suggestion : Temps pluvieux. Venez vous réchauffer dans notre salon douillet.",
    
    drink_cold: "🍹 Boisson suggérée : Un Mojito signature bien frais ou un jus pressé de saison.",
    drink_mild: "☕ Boisson suggérée : Un Espresso de spécialité ou notre thé vert à la menthe traditionnel.",
    drink_warm: "🍵 Boisson suggérée : Un Capuccino crémeux ou un thé tunisien chaud aux pignons.",
    
    food_light: "🥗 Plat conseillé : Une salade méditerranéenne fraîche ou nos petits fours signature.",
    food_heavy: "🍽️ Plat conseillé : Nos pâtes fraîches du chef ou un panini toasté chaud."
  },
  en: {
    title: "Djerba Weather",
    sub: "Houmt Souk",
    loading: "Fetching island breeze...",
    temp: "Temperature",
    wind: "Wind",
    error: "Weather offline",
    
    rec_inside: "🌿 Our tip: Relax in our air-conditioned indoor lounge for cool comfort.",
    rec_terrace: "🌺 Our tip: Enjoy the pleasant Mediterranean breeze on our Garden Terrace!",
    rec_windy: "💨 Our tip: It's breezy in Djerba today. We suggest the protected terrace corner or cozy indoor seats.",
    rec_rainy: "🌧️ Our tip: Rainy weather. Find a cozy warm spot inside our lounge.",
    
    drink_cold: "🍹 Suggested drink: A fresh signature Mocktail or seasonal cold-pressed juice.",
    drink_mild: "☕ Suggested drink: A hand-pulled Espresso or traditional mint tea.",
    drink_warm: "🍵 Suggested drink: A creamy Cappuccino or warm Tunisian tea with pine nuts.",
    
    food_light: "🥗 Suggested bite: A fresh Mediterranean salad or light pastries.",
    food_heavy: "🍽️ Suggested bite: Our Chef's hot pasta selection or a toasted panini."
  },
  ar: {
    title: "طقس جربة الآن",
    sub: "حومة السوق",
    loading: "جاري تحميل حالة الطقس...",
    temp: "الحرارة",
    wind: "الرياح",
    error: "الطقس غير متاح",
    
    rec_inside: "🌿 نصيحتنا: تفضل بالجلوس في الصالة الداخلية المكيفة لراحة تامة.",
    rec_terrace: "🌺 نصيحتنا: استمتع بالنسيم العليل في تراس الحديقة الخارجي!",
    rec_windy: "💨 نصيحتنا: نسيم جربة قوي اليوم. نقترح الجلوس في الزاوية المحمية بالتراس أو بالداخل.",
    rec_rainy: "🌧️ نصيحتنا: الأجواء ممطرة. تفضل بالجلوس في صالتنا الداخلية الدافئة.",
    
    drink_cold: "🍹 مشروب مقترح: موهيتو بارد ومنعش أو عصير موسم طازج.",
    drink_mild: "☕ مشروب مقترح: كوب إسبريسو مميز أو شاي أخضر بالنعناع.",
    drink_warm: "🍵 مشروب مقترح: كابوتشينو دافئ أو شاي تونسي ساخن بالبندق.",
    
    food_light: "🥗 وجبة مقترحة: سلطة متوسطية طازجة أو مقبلات خفيفة.",
    food_heavy: "🍽️ وجبة مقترحة: باستا الشيف الساخنة أو بانيني محمص ولذيذ."
  },
  de: {
    title: "Wetter auf Djerba",
    sub: "Houmt Souk",
    loading: "Wetterdaten werden geladen...",
    temp: "Temperatur",
    wind: "Wind",
    error: "Wetter offline",
    
    rec_inside: "🌿 Unser Tipp: Entspannen Sie in unserer klimatisierten Innen-Lounge.",
    rec_terrace: "🌺 Unser Tipp: Genießen Sie die milde mediterrane Brise auf unserer Gartenterrasse!",
    rec_windy: "💨 Unser Tipp: Es ist windig heute. Nehmen Sie Platz im windgeschützten Bereich oder drinnen.",
    rec_rainy: "🌧️ Unser Tipp: Regnerisch. Machen Sie es sich in unserer gemütlichen Lounge gemütlich.",
    
    drink_cold: "🍹 Getränke-Tipp: Ein eiskalter Signature Mocktail oder frischer Saft.",
    drink_mild: "☕ Getränke-Tipp: Ein Spezialitäten-Espresso oder traditioneller Minztee.",
    drink_warm: "🍵 Getränke-Tipp: Ein cremiger Cappuccino oder heißer tunesischer Pinienkerntee.",
    
    food_light: "🥗 Speisen-Tipp: Ein frischer mediterraner Salat oder feines Gebäck.",
    food_heavy: "🍽️ Speisen-Tipp: Heiße Pasta vom Chef oder ein getoastetes Panini."
  },
  it: {
    title: "Meteo a Djerba",
    sub: "Houmt Souk",
    loading: "Caricamento meteo...",
    temp: "Temperatura",
    wind: "Vento",
    error: "Meteo non disponibile",
    
    rec_inside: "🌿 Consiglio: Rilassati nella nostra sala interna climatizzata per il massimo comfort.",
    rec_terrace: "🌺 Consiglio: Goditi la piacevole brezza mediterranea sulla nostra Terrazza Giardino!",
    rec_windy: "💨 Consiglio: C'è vento a Djerba oggi. Consigliamo la terrazza riparata o la sala interna.",
    rec_rainy: "🌧️ Consiglio: Giornata piovosa. Trova un posto accogliente nella nostra lounge interna.",
    
    drink_cold: "🍹 Drink consigliato: Un Mocktail fresco della casa o una spremuta stagionale.",
    drink_mild: "☕ Drink consigliato: Un Espresso speciale o un tè alla menta tradizionale.",
    drink_warm: "🍵 Drink consigliato: Un Cappuccino cremoso o un tè caldo tunisino con pinoli.",
    
    food_light: "🥗 Piatto consigliato: Un'insalata mediterranea fresca o pasticceria leggera.",
    food_heavy: "🍽️ Piatto consigliato: Le nostre paste calde dello Chef o un panini tostato."
  }
};

export function DjerbaWeather() {
  const { lang } = useI18n();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const t = (key: string) => {
    return weatherTranslations[lang]?.[key] || weatherTranslations.en[key] || key;
  };

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=33.8767&longitude=10.8550&current_weather=true"
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.current_weather) {
          setWeather({
            temperature: Math.round(data.current_weather.temperature),
            windspeed: Math.round(data.current_weather.windspeed),
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-[2rem] p-6 text-center border border-border/40 shadow-soft">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent mb-2" />
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Silent fail if offline or API error
  }

  const { temperature, windspeed, weathercode } = weather;

  // Determine weather conditions
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weathercode);
  const isWindy = windspeed > 22; // km/h
  const isHot = temperature >= 28;
  const isCold = temperature < 20;

  // Render weather icon based on open-meteo weather code
  const getWeatherIcon = () => {
    if (isRainy) return <CloudRain className="h-8 w-8 text-blue-400 animate-bounce" />;
    if (weathercode > 2) return <Cloud className="h-8 w-8 text-gray-400" />;
    return <Sun className="h-8 w-8 text-amber-400 animate-spin-slow" />;
  };

  // Select dynamic recommendations based on weather
  const getSeatingRec = () => {
    if (isRainy) return t("rec_rainy");
    if (isWindy) return t("rec_windy");
    if (isHot) return t("rec_inside");
    return t("rec_terrace");
  };

  const getDrinkRec = () => {
    if (isHot) return t("drink_cold");
    if (isCold) return t("drink_warm");
    return t("drink_mild");
  };

  const getFoodRec = () => {
    if (isHot) return t("food_light");
    return t("food_heavy");
  };

  // Construct query parameter targets based on weather conditions
  const getDrinkQuery = () => {
    if (isHot) return "Lemonade";
    if (isCold) return "Cappuccino";
    return "Espresso";
  };

  const getFoodQuery = () => {
    if (isHot) return "Salad";
    if (isCold) return "Burger";
    return "Baklava";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass relative overflow-hidden rounded-[2rem] border border-border/40 p-6 shadow-elegant text-foreground"
    >
      {/* Light gradient indicator based on weather */}
      <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl opacity-20 pointer-events-none ${
        isHot ? "bg-amber-500" : isRainy ? "bg-blue-500" : "bg-accent"
      }`} />

      {/* Header info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-semibold block mb-1">
            {t("title")}
          </span>
          <h4 className="font-display font-semibold text-lg flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            {t("sub")}
          </h4>
        </div>
        <div className="flex items-center gap-3">
          {getWeatherIcon()}
          <div className="text-right">
            <span className="text-2xl font-semibold font-display tracking-tighter block leading-none">
              {temperature}°C
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-1">
              {windspeed} km/h {t("wind")}
            </span>
          </div>
        </div>
      </div>

      <div className="hairline-gold my-4" />

      {/* Suggestion list */}
      <div className="space-y-3">
        <p className="text-xs leading-relaxed font-medium bg-accent/10 text-accent-foreground px-3.5 py-2.5 rounded-2xl border border-accent/20">
          {getSeatingRec()}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <Link
            to="/menu"
            search={{ search: getDrinkQuery() }}
            className="flex items-center gap-2 bg-card/50 hover:bg-accent/10 border border-border/30 hover:border-accent/40 p-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Coffee className="h-4 w-4 text-accent shrink-0" />
            <span className="line-clamp-2">{getDrinkRec()}</span>
          </Link>
          <Link
            to="/menu"
            search={{ search: getFoodQuery() }}
            className="flex items-center gap-2 bg-card/50 hover:bg-accent/10 border border-border/30 hover:border-accent/40 p-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Utensils className="h-4 w-4 text-accent shrink-0" />
            <span className="line-clamp-2">{getFoodRec()}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
