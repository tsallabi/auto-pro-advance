
import {
    AuctionFeeTier,
    LocationData,
    OceanFreightRoute,
    VehicleType,
    CalculationResult,
    AuctionSource,
    CalculationSettings
} from '../types/calculator';

export const DEFAULT_ENV_FEE = 15;

export const DEFAULT_SETTINGS: CalculationSettings = {
    makinaFee: 100,
    docFee: 85,
    gateFee: 95,
    titleFee: 20,
    envFee: 15,
    auctionFeeLocal: 150
};

export const MOCK_LOCATIONS: LocationData[] = [
    { id: 'ga-atlanta', name: 'GA - ATLANTA', state: 'GA', nearestPort: 'Savannah, GA', inlandPrice: 325 },
    { id: 'fl-miami', name: 'FL - MIAMI', state: 'FL', nearestPort: 'Savannah, GA', inlandPrice: 250 },
    { id: 'tx-houston', name: 'TX - HOUSTON', state: 'TX', nearestPort: 'Houston, TX', inlandPrice: 225 },
    { id: 'ca-los-angeles', name: 'CA - LOS ANGELES', state: 'CA', nearestPort: 'Los Angeles, CA', inlandPrice: 165 },
    { id: 'nj-new-jersey', name: 'NJ - NEW JERSEY', state: 'NJ', nearestPort: 'New Jersey, NJ', inlandPrice: 200 },
    { id: 'md-baltimore', name: 'MD - BALTIMORE', state: 'MD', nearestPort: 'Baltimore, MD', inlandPrice: 225 },
    { id: 'il-chicago', name: 'IL - CHICAGO', state: 'IL', nearestPort: 'Chicago, IL', inlandPrice: 250 },
    // ... (Full list truncated for brevity, but I will include major ones)
];

export const MOCK_OCEAN_RATES: OceanFreightRoute[] = [
    { fromPort: 'New Jersey, NJ', toCountry: 'LIBYA', toPort: 'KHOMS', priceSedan: 900, priceSuv: 1000, pricePickup: 1300 },
    { fromPort: 'Savannah, GA', toCountry: 'LIBYA', toPort: 'KHOMS', priceSedan: 900, priceSuv: 1000, pricePickup: 1300 },
    { fromPort: 'Houston, TX', toCountry: 'LIBYA', toPort: 'KHOMS', priceSedan: 900, priceSuv: 1000, pricePickup: 1300 },
    { fromPort: 'Los Angeles, CA', toCountry: 'LIBYA', toPort: 'KHOMS', priceSedan: 1250, priceSuv: 1350, pricePickup: 1850 },
    { fromPort: 'New Jersey, NJ', toCountry: 'UAE', toPort: 'JEBEL ALI', priceSedan: 1100, priceSuv: 1200, pricePickup: 1500 },
    { fromPort: 'New Jersey, NJ', toCountry: 'JORDAN', toPort: 'AQABA', priceSedan: 1000, priceSuv: 1100, pricePickup: 1400 },
    { fromPort: 'New Jersey, NJ', toCountry: 'IRAQ', toPort: 'UMM QASR', priceSedan: 1300, priceSuv: 1400, pricePickup: 1700 },
];

export const MOCK_AUCTION_FEES: AuctionFeeTier[] = [
    { minPrice: 0, maxPrice: 49.99, value: 131, isPercent: false },
    { minPrice: 50.00, maxPrice: 99.99, value: 131, isPercent: false },
    { minPrice: 100.00, maxPrice: 199.99, value: 205, isPercent: false },
    { minPrice: 200.00, maxPrice: 299.99, value: 240, isPercent: false },
    { minPrice: 300.00, maxPrice: 349.99, value: 265, isPercent: false },
    { minPrice: 2500.00, maxPrice: 2999.99, value: 700, isPercent: false },
    { minPrice: 3000.00, maxPrice: 3499.99, value: 745, isPercent: false },
    { minPrice: 15000.00, maxPrice: 99999999, value: 6.00, isPercent: true, virtualFee: 160 }
];

export const calculateTotalCost = (
    vehiclePrice: number,
    vehicleType: VehicleType,
    location: LocationData | undefined,
    destinationCountry: string,
    destinationPort: string,
    customsPercentage: number,
    source: AuctionSource = AuctionSource.COPART,
    settings: CalculationSettings = DEFAULT_SETTINGS
): CalculationResult => {
    const isLocal = source === AuctionSource.LOCAL;

    // 1. Auction Fee
    let auctionFee = 0;

    if (isLocal) {
        auctionFee = settings.auctionFeeLocal;
    } else {
        const tier = MOCK_AUCTION_FEES.find(t => vehiclePrice >= t.minPrice && vehiclePrice <= t.maxPrice)
            || MOCK_AUCTION_FEES[MOCK_AUCTION_FEES.length - 1];

        if (tier) {
            if (tier.isPercent) {
                const buyerFee = vehiclePrice * (tier.value / 100);
                const virtualFee = tier.virtualFee || 0;
                auctionFee = Math.round(buyerFee + virtualFee + settings.gateFee + settings.titleFee + settings.envFee);
            } else {
                auctionFee = tier.value;
            }
        }
    }

    // 2. Freight
    let inlandFreight = 0;
    let oceanFreight = 0;

    if (!isLocal && location) {
        inlandFreight = location.inlandPrice;
        const route = MOCK_OCEAN_RATES.find(
            r => r.fromPort === location.nearestPort &&
                r.toCountry === destinationCountry &&
                r.toPort === destinationPort
        );

        if (route) {
            if (vehicleType === VehicleType.PICKUP) oceanFreight = route.pricePickup;
            else if (vehicleType === VehicleType.SUV) oceanFreight = route.priceSuv;
            else oceanFreight = route.priceSedan;
        }
    }

    const customsDuty = isLocal ? 0 : Math.round(vehiclePrice * (customsPercentage / 100));

    const total = vehiclePrice + auctionFee + settings.docFee + inlandFreight + oceanFreight + settings.makinaFee + customsDuty;

    return {
        vehiclePrice,
        auctionFee,
        gateFee: settings.gateFee,
        documentationFee: settings.docFee,
        inlandFreight,
        oceanFreight,
        makinaFee: settings.makinaFee,
        customsDuty,
        total,
        currency: 'USD'
    };
};
