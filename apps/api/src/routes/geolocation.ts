import express from 'express';

const router = express.Router();

/**
 * Cloudflare geolocation endpoint
 * Returns country code from Cloudflare headers
 */
router.get('/country', (req, res) => {
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Cloudflare provides country code in CF-IPCountry header
    const cloudflareCountry = req.headers['cf-ipcountry'] as string;
    
    // Get country from various headers (Cloudflare, other CDNs)
    const country = cloudflareCountry || 
                   (req.headers['x-country-code'] as string) ||
                   (req.headers['x-forwarded-country'] as string) ||
                   null;

    // Get additional info from Cloudflare headers
    const clientIP = req.headers['cf-connecting-ip'] || 
                    req.headers['x-forwarded-for'] || 
                    req.ip;

    const continent = req.headers['cf-ipcontinentCode'];
    const timezone = req.headers['cf-timezone'];

    if (!country) {
      return res.status(404).json({
        error: 'Country information not available',
        message: 'This endpoint requires Cloudflare or compatible CDN with geolocation headers',
        headers: {
          'cf-ipcountry': cloudflareCountry,
          'x-country-code': req.headers['x-country-code'],
          'x-forwarded-country': req.headers['x-forwarded-country']
        }
      });
    }

    // Country name mapping
    const countryNames: Record<string, string> = {
      TH: 'Thailand',
      US: 'United States',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      JP: 'Japan',
      KR: 'South Korea',
      CN: 'China',
      IN: 'India',
      SG: 'Singapore',
      MY: 'Malaysia',
      VN: 'Vietnam',
      ID: 'Indonesia',
      PH: 'Philippines',
      AU: 'Australia',
      CA: 'Canada',
      // Add more as needed
    };

    const response = {
      country: country.toUpperCase(),
      countryName: countryNames[country.toUpperCase()] || country,
      continent: continent || null,
      timezone: timezone || null,
      ip: clientIP,
      method: 'cloudflare',
      headers: {
        'cf-ipcountry': cloudflareCountry,
        'cf-ipcontinentCode': continent,
        'cf-timezone': timezone,
        'cf-connecting-ip': req.headers['cf-connecting-ip']
      }
    };

    console.log('🌍 Cloudflare geolocation response:', response);

    res.json(response);
  } catch (error) {
    console.error('❌ Geolocation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process geolocation request'
    });
  }
});

// Handle preflight requests
router.options('/country', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

export default router;
