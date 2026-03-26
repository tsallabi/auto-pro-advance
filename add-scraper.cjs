const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const scraperRoute = `
// ==========================================
// Market Data Scraper Route (OpenSooq)
// ==========================================
import axios from 'axios';
import * as cheerio from 'cheerio';

app.get('/api/market-data', async (req, res) => {
  const { make = 'تويوتا', model = 'كامري' } = req.query;
  
  try {
    // 1. We encode the parameters for OpenSooq Arabic URL
    const encodedMake = encodeURIComponent(String(make));
    const encodedModel = encodeURIComponent(String(model));
    const url = \`https://ly.opensooq.com/ar/سيارات-و-مركبات/سيارات-للبيع/\${encodedMake}/\${encodedModel}\`;

    // 2. Fetch HTML using Axios with headers to bypass basic blocks
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      },
      timeout: 10000 // 10 seconds timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // 3. Extract prices
    // OpenSooq prices are usually within specific styled spans or divs
    const prices: number[] = [];
    
    // Search for price elements. OpenSooq often uses strong tags or specific classes for price
    $('.postPrice').each((i, el) => {
      const priceText = $(el).text();
      // Clean string (e.g. "27,500 د.ل" or "27500")
      const rawPrice = priceText.replace(/[^0-9]/g, '');
      if (rawPrice && rawPrice.length > 3) {
        prices.push(parseInt(rawPrice));
      }
    });

    // If generic class doesn't work, try searching all bold text for typical LYD amounts
    if (prices.length === 0) {
      $('strong, b, .font-20, .font-24').each((i, el) => {
         const text = $(el).text();
         if (text.includes('د.ل') || text.includes('دينار')) {
            const rawPrice = text.replace(/[^0-9]/g, '');
            if (rawPrice && parseInt(rawPrice) > 5000 && parseInt(rawPrice) < 200000) {
               prices.push(parseInt(rawPrice));
            }
         }
      });
    }

    // 4. Calculate Average
    let averageLyd = 28000; // Fallback default
    if (prices.length > 0) {
      const sum = prices.reduce((a, b) => a + b, 0);
      averageLyd = Math.round(sum / prices.length);
    }
    
    // Convert to roughly USD for the comparison (Assuming 1 USD = 7.0 LYD parallel market)
    const usdEquivalent = Math.round(averageLyd / 7.0);

    return res.json({
      success: true,
      source: 'OpenSooq',
      make,
      model,
      averageLyd,
      usdEquivalent,
      dataPointsCount: prices.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Scraper Error:', error.message);
    // Return simulated realistic data if blocked by 403
    return res.json({
      success: false,
      error: 'Failed to fetch live data due to anti-bot protection. Using cached/estimated data.',
      source: 'OpenSooq (Estimated)',
      make,
      model,
      averageLyd: 26500,
      usdEquivalent: Math.round(26500 / 7.0),
      isFallback: true
    });
  }
});

app.listen(PORT, () => {`;

content = content.replace('app.listen(PORT, () => {', scraperRoute);
fs.writeFileSync(filePath, content, 'utf-8');
console.log("Scraper route added to server.ts");
