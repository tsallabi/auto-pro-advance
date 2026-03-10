
export enum VehicleType {
    SEDAN = 'Sedan',
    SUV = 'SUV',
    PICKUP = 'Pickup Truck',
    MOTORCYCLE = 'Motorcycle',
    HEAVY_DUTY = 'Heavy Duty'
}

export enum AuctionSource {
    COPART = 'Copart',
    IAA = 'IAA',
    MANHEIM = 'Manheim',
    LOCAL = 'Local Libya',
    OTHER = 'Other'
}

export interface CalculationSettings {
    makinaFee: number;
    docFee: number;
    gateFee: number;
    titleFee: number;
    envFee: number;
    auctionFeeLocal: number; // Flat fee for local auctions
}

export interface LocationData {
    id: string;
    name: string;
    state: string;
    nearestPort: string;
    inlandPrice: number;
}

export interface OceanFreightRoute {
    fromPort: string;
    toCountry: string;
    toPort: string;
    priceSedan: number;
    priceSuv: number;
    pricePickup: number;
}

export interface AuctionFeeTier {
    minPrice: number;
    maxPrice: number;
    value: number;
    isPercent: boolean;
    virtualFee?: number;
}

export interface CalculationResult {
    vehiclePrice: number;
    auctionFee: number;
    gateFee: number;
    documentationFee: number;
    inlandFreight: number;
    oceanFreight: number;
    makinaFee: number;
    customsDuty: number;
    total: number;
    currency: string;
}
