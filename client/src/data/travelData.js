/**
 * Travel Intelligence & Flight Price Data (Origin: New Delhi - DEL)
 * Includes flight ticket estimates from Delhi, seasonal inflation multipliers,
 * total travel budget breakdowns, and recommended best times to travel.
 */

export const DESTINATION_TRAVEL_DATA = {
  'UK': {
    countryName: 'United Kingdom (London)',
    currency: 'GBP (£)',
    exchangeRateINR: 106.50,
    baseFlightDelhiINR: 58000, // Round trip from DEL
    baseDailyStayINR: 12000,
    recommendedDays: 7,
    bestMonthsToTravel: 'May to September & December',
    cheapestMonthsToTravel: 'January to March (Save ~30% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Jun-Aug & Dec)', flightMultiplier: 1.50, hotelMultiplier: 1.40, note: 'Summer holidays & Christmas peak flight fares' },
      shoulder: { label: 'Shoulder Season (Apr-May & Sep-Oct)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Optimal weather with standard flight pricing' },
      offPeak: { label: 'Low / Value Season (Nov & Jan-Mar)', flightMultiplier: 0.75, hotelMultiplier: 0.70, note: 'Cold winter, up to 30% flight fare discount' }
    }
  },
  'USA': {
    countryName: 'United States (New York / West Coast)',
    currency: 'USD ($)',
    exchangeRateINR: 83.80,
    baseFlightDelhiINR: 85000,
    baseDailyStayINR: 15000,
    recommendedDays: 10,
    bestMonthsToTravel: 'September to November & April to May',
    cheapestMonthsToTravel: 'January to February (Save ~35% on flights)',
    seasons: {
      peak: { label: 'Peak Season (May-Jul & Dec)', flightMultiplier: 1.55, hotelMultiplier: 1.45, note: 'Summer vacation surge in US flights' },
      shoulder: { label: 'Shoulder Season (Sep-Nov & Apr)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Pleasant autumn & spring foliage' },
      offPeak: { label: 'Low / Value Season (Jan-Mar)', flightMultiplier: 0.70, hotelMultiplier: 0.75, note: 'Best flight bargains from Delhi' }
    }
  },
  'UAE': {
    countryName: 'UAE (Dubai / Abu Dhabi)',
    currency: 'AED (Dirham)',
    exchangeRateINR: 22.80,
    baseFlightDelhiINR: 22000,
    baseDailyStayINR: 8000,
    recommendedDays: 5,
    bestMonthsToTravel: 'November to March',
    cheapestMonthsToTravel: 'June to August (Hot Summer - Save ~40% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Nov-Mar & Shopping Festival)', flightMultiplier: 1.40, hotelMultiplier: 1.50, note: 'Dubai Shopping Fest & mild winter weather' },
      shoulder: { label: 'Shoulder Season (Apr & Oct)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Moderate desert climate' },
      offPeak: { label: 'Low / Value Season (Jun-Aug)', flightMultiplier: 0.65, hotelMultiplier: 0.50, note: 'Extreme summerheat, heavy hotel discounts' }
    }
  },
  'Europe': {
    countryName: 'Western Europe (Paris / Rome / Swiss)',
    currency: 'EUR (€)',
    exchangeRateINR: 91.20,
    baseFlightDelhiINR: 52000,
    baseDailyStayINR: 11000,
    recommendedDays: 8,
    bestMonthsToTravel: 'April to June & September to October',
    cheapestMonthsToTravel: 'November to February (Save ~30% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Jun-Aug & Christmas)', flightMultiplier: 1.45, hotelMultiplier: 1.40, note: 'Euro summer vacation boom' },
      shoulder: { label: 'Shoulder Season (Apr-May & Sep-Oct)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Best spring bloom & crisp autumn weather' },
      offPeak: { label: 'Low / Value Season (Nov-Mar)', flightMultiplier: 0.72, hotelMultiplier: 0.70, note: 'Winter charm & lowest flight fares' }
    }
  },
  'Thailand': {
    countryName: 'Thailand (Bangkok / Phuket)',
    currency: 'THB (Baht)',
    exchangeRateINR: 2.45,
    baseFlightDelhiINR: 18000,
    baseDailyStayINR: 4500,
    recommendedDays: 5,
    bestMonthsToTravel: 'November to April',
    cheapestMonthsToTravel: 'July to October (Monsoon - Save ~35% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Nov-Feb & Songkran in Apr)', flightMultiplier: 1.35, hotelMultiplier: 1.30, note: 'Sunny beaches & cool dry breeze' },
      shoulder: { label: 'Shoulder Season (May & Oct)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Good value with occasional rain showers' },
      offPeak: { label: 'Low / Value Season (Jun-Sep)', flightMultiplier: 0.70, hotelMultiplier: 0.65, note: 'Monsoon travel with heavy flight discounts' }
    }
  },
  'Singapore': {
    countryName: 'Singapore',
    currency: 'SGD ($)',
    exchangeRateINR: 62.50,
    baseFlightDelhiINR: 26000,
    baseDailyStayINR: 9500,
    recommendedDays: 4,
    bestMonthsToTravel: 'November to January & June to August',
    cheapestMonthsToTravel: 'February to April (Save ~25% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Nov-Jan & F1 in Sep)', flightMultiplier: 1.35, hotelMultiplier: 1.40, note: 'Year-end festive lights & Formula 1' },
      shoulder: { label: 'Shoulder Season (May-Aug)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Great Food Fest & Shopping Sales' },
      offPeak: { label: 'Low / Value Season (Feb-Apr)', flightMultiplier: 0.78, hotelMultiplier: 0.80, note: 'Fewer crowds & cheap flight tickets' }
    }
  },
  'Japan': {
    countryName: 'Japan (Tokyo / Kyoto)',
    currency: 'JPY (¥)',
    exchangeRateINR: 0.56,
    baseFlightDelhiINR: 48000,
    baseDailyStayINR: 9000,
    recommendedDays: 7,
    bestMonthsToTravel: 'March to May (Cherry Blossom) & Oct-Nov',
    cheapestMonthsToTravel: 'June to August (Summer - Save ~30% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Sakura Mar-Apr & Autumn Oct-Nov)', flightMultiplier: 1.50, hotelMultiplier: 1.50, note: 'Cherry Blossom surge from Delhi' },
      shoulder: { label: 'Shoulder Season (May & Sep)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Mild weather & moderate pricing' },
      offPeak: { label: 'Low / Value Season (Jun-Aug & Jan-Feb)', flightMultiplier: 0.72, hotelMultiplier: 0.70, note: 'Summer humidity/snow, cheap flights' }
    }
  },
  'Bali': {
    countryName: 'Bali (Indonesia)',
    currency: 'IDR (Rupiah)',
    exchangeRateINR: 0.0054,
    baseFlightDelhiINR: 28000,
    baseDailyStayINR: 4000,
    recommendedDays: 6,
    bestMonthsToTravel: 'April to October',
    cheapestMonthsToTravel: 'November to March (Rainy Season - Save ~30% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Jul-Aug & Dec-Jan)', flightMultiplier: 1.40, hotelMultiplier: 1.35, note: 'Dry sunny beach weather' },
      shoulder: { label: 'Shoulder Season (Apr-Jun & Sep-Oct)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Perfect tropical climate & low crowd' },
      offPeak: { label: 'Low / Value Season (Nov-Mar)', flightMultiplier: 0.72, hotelMultiplier: 0.65, note: 'Wet season discounts on flights & villas' }
    }
  },
  'Maldives': {
    countryName: 'Maldives (Overwater Resort)',
    currency: 'USD ($)',
    exchangeRateINR: 83.80,
    baseFlightDelhiINR: 25000,
    baseDailyStayINR: 18000,
    recommendedDays: 4,
    bestMonthsToTravel: 'November to April',
    cheapestMonthsToTravel: 'May to October (Monsoon - Save ~40% on luxury resorts)',
    seasons: {
      peak: { label: 'Peak Season (Dec-Apr)', flightMultiplier: 1.45, hotelMultiplier: 1.60, note: 'Crystal clear waters & sunny weather' },
      shoulder: { label: 'Shoulder Season (Oct & May)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Transition month with great deals' },
      offPeak: { label: 'Low / Value Season (Jun-Sep)', flightMultiplier: 0.70, hotelMultiplier: 0.55, note: 'Monsoon discounts on luxury overwater villas' }
    }
  },
  'Goa': {
    countryName: 'Goa (Domestic India)',
    currency: 'INR (₹)',
    exchangeRateINR: 1.00,
    baseFlightDelhiINR: 8500,
    baseDailyStayINR: 3500,
    recommendedDays: 4,
    bestMonthsToTravel: 'November to February',
    cheapestMonthsToTravel: 'June to September (Monsoon - Save ~50% on flights)',
    seasons: {
      peak: { label: 'Peak Season (Nov-Feb & Sunburn/Dec 31)', flightMultiplier: 1.65, hotelMultiplier: 1.80, note: 'Winter beach party peak in Goa' },
      shoulder: { label: 'Shoulder Season (Oct & Mar-Apr)', flightMultiplier: 1.00, hotelMultiplier: 1.00, note: 'Pleasant warm beach weather' },
      offPeak: { label: 'Low / Value Season (Jun-Sep)', flightMultiplier: 0.55, hotelMultiplier: 0.45, note: 'Lush green monsoon Goa experience' }
    }
  }
};
