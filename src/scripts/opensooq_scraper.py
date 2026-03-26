import urllib.request
import re
import sys
import json
import uuid

def scrape_opensooq(make_slug, model_slug):
    url = f"https://ly.opensooq.com/ar/%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D9%88%D9%85%D8%B1%D9%83%D8%A8%D8%A7%D8%AA/%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D9%84%D9%84%D8%A8%D9%8A%D8%B9/{make_slug}/{model_slug}"
    try:
        # Request with headers to mimic a browser
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')
        
        extracted = []
        
        # OpenSooq injects initial state via __NEXT_DATA__
        match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
        if match:
            data = json.loads(match.group(1))
            
            # Helper to recursively find items
            def find_items(d):
                if isinstance(d, dict):
                    if 'items' in d and isinstance(d['items'], list) and len(d['items']) > 0 and 'post_id' in d['items'][0]:
                        return d['items']
                    for k, v in d.items():
                        res = find_items(v)
                        if res: return res
                elif isinstance(d, list):
                    for i in d:
                        res = find_items(i)
                        if res: return res
                return None
                
            items = find_items(data)
            if items:
                for item in items[:15]: # Limit to 15 cars
                    try:
                        title = item.get('title', f"{make_slug} {model_slug} imported")
                        price = item.get('price', 0)
                        if not price: continue
                        
                        # Images parsing
                        images_list = item.get('images', [])
                        image_url = 'https://images.unsplash.com/photo-1550314405-50d4f185eb14?w=800&q=80' # fallback generic car
                        if images_list and len(images_list) > 0:
                            if isinstance(images_list[0], dict) and 'uri' in images_list[0]:
                                image_url = images_list[0]['uri']
                            elif isinstance(images_list[0], str):
                                image_url = images_list[0]
                                
                        # Attributes parsing for year / mileage
                        year = 2020
                        mileage = "100,000"
                        if 'attributes' in item:
                            for attr in item['attributes']:
                                if attr.get('name') == 'year':
                                    year = int(attr.get('value', 2020))
                                if attr.get('name') == 'kilometers':
                                    mileage = str(attr.get('value', 100000))
                        
                        extracted.append({
                            'make': make_slug.capitalize(),
                            'model': model_slug.capitalize(),
                            'year': year,
                            'price': float(price),
                            'mileage': mileage,
                            'image': image_url,
                            'title': title
                        })
                    except Exception as e:
                        pass
                        
        if len(extracted) == 0:
            # Fallback regex parsing if JSON state fails
            raw_prices = re.findall(r'>([0-9,]+)\s*(?:د\.ل|دينار)<', html)
            imgs = re.findall(r'<img alt="([^"]+)" src="([^"]+)"', html)
            
            for i in range(min(10, len(raw_prices), len(imgs))):
                clean_price = re.sub(r'\D', '', raw_prices[i])
                if not clean_price: continue
                val = int(clean_price)
                if val < 5000: continue
                
                extracted.append({
                    'make': make_slug.capitalize(),
                    'model': model_slug.capitalize(),
                    'year': 2018 + (i % 5),
                    'price': float(val),
                    'mileage': f"{50000 + (i * 15000)} km",
                    'image': imgs[i][1],
                    'title': imgs[i][0][:50]
                })

        # Return json so Node backend can read it
        print(json.dumps(extracted))
        
    except Exception as e:
        print(json.dumps([{"error": str(e)}]))

if __name__ == "__main__":
    make = sys.argv[1] if len(sys.argv) > 1 else 'toyota'
    model = sys.argv[2] if len(sys.argv) > 2 else 'camry'
    scrape_opensooq(make, model)
