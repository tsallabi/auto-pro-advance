import { Car, FeeEstimate } from './types';

export const mockCars: Car[] = [
  {
    id: '1',
    lotNumber: '58392012',
    vin: '1G1YB2D47H51*****',
    make: 'Chevrolet',
    model: 'Corvette Stingray',
    year: 2021,
    odometer: 12450,
    engine: '6.2L V8 DI',
    drive: 'RWD',
    primaryDamage: 'Front End',
    titleType: 'Salvage Title',
    location: 'TX - Houston',
    currentBid: 32500,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
    ],
    auctionEndDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    status: 'live'
  },
  {
    id: '2',
    lotNumber: '49281033',
    vin: '5YJ3E1EA0J8******',
    make: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2022,
    odometer: 8300,
    engine: 'Electric',
    drive: 'AWD',
    primaryDamage: 'Side',
    titleType: 'Clean Title',
    location: 'CA - Los Angeles',
    currentBid: 18000,
    buyItNow: 22000,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800'
    ],
    auctionEndDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'upcoming'
  },
  {
    id: '3',
    lotNumber: '73829102',
    vin: 'JTDKN3DP8E*******',
    make: 'Toyota',
    model: 'Camry SE',
    year: 2020,
    odometer: 45200,
    engine: '2.5L 4-Cylinder',
    drive: 'FWD',
    primaryDamage: 'Rear End',
    titleType: 'Salvage Title',
    location: 'FL - Miami',
    currentBid: 4500,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800' // Placeholder
    ],
    auctionEndDate: new Date(Date.now() + 1800000).toISOString(), // 30 mins
    status: 'live'
  },
  {
    id: '4',
    lotNumber: '10293847',
    vin: 'WBA53AR08M*******',
    make: 'BMW',
    model: 'M3 Competition',
    year: 2023,
    odometer: 3100,
    engine: '3.0L Twin-Turbo I6',
    drive: 'AWD',
    primaryDamage: 'Water/Flood',
    titleType: 'Certificate of Destruction',
    location: 'NY - Long Island',
    currentBid: 28000,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1555353540-64fd1b6226f7?auto=format&fit=crop&q=80&w=800'
    ],
    auctionEndDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
    status: 'upcoming'
  }
];

export const calculateFees = (bid: number): FeeEstimate => {
  // Simplified Copart/IAAI style fee structure
  const buyerFee = bid * 0.05 + 200; // 5% + $200 base
  const virtualBidFee = bid > 5000 ? 129 : 79;
  const gateFee = 79;

  return {
    bidAmount: bid,
    buyerFee,
    virtualBidFee,
    gateFee,
    total: bid + buyerFee + virtualBidFee + gateFee
  };
};
