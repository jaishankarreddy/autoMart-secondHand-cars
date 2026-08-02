export type OfferStatus = 'Pending' | 'Accepted' | 'Countered' | 'Rejected';

export interface AdminOffer {
  id: string;
  vehicle: string;
  customer: string;
  phone: string;
  offerPrice: number;
  askingPrice: number;
  status: OfferStatus;
  date: string;
}

export const ADMIN_OFFERS: AdminOffer[] = [
  { id: 'O-1008', vehicle: 'Hyundai Creta SX (O) 2022', customer: 'Ravi Kumar', phone: '98450 12345', offerPrice: 1550000, askingPrice: 1680000, status: 'Pending', date: 'Today, 10:42 AM' },
  { id: 'O-1007', vehicle: 'Royal Enfield Classic 350 2022', customer: 'Priya Sharma', phone: '99011 88776', offerPrice: 178000, askingPrice: 190000, status: 'Countered', date: 'Today, 9:15 AM' },
  { id: 'O-1006', vehicle: 'Mahindra XUV700 AX7 2023', customer: 'Arun Nair', phone: '97400 55667', offerPrice: 2100000, askingPrice: 2190000, status: 'Pending', date: 'Yesterday, 6:30 PM' },
  { id: 'O-1005', vehicle: 'Tata Nexon XZ+ 2021', customer: 'Sneha Rao', phone: '96321 44556', offerPrice: 910000, askingPrice: 960000, status: 'Accepted', date: 'Yesterday, 2:05 PM' },
  { id: 'O-1004', vehicle: 'Yamaha R15 V4 2023', customer: 'Karthik Gowda', phone: '98801 22334', offerPrice: 172000, askingPrice: 185000, status: 'Rejected', date: 'Jul 30, 4:50 PM' },
  { id: 'O-1003', vehicle: 'Honda City ZX CVT 2022', customer: 'Anita Desai', phone: '99450 77889', offerPrice: 1380000, askingPrice: 1420000, status: 'Countered', date: 'Jul 30, 11:20 AM' },
  { id: 'O-1002', vehicle: 'Maruti Suzuki Brezza ZXI 2023', customer: 'Vikas Patil', phone: '97654 33221', offerPrice: 1090000, askingPrice: 1140000, status: 'Accepted', date: 'Jul 29, 5:10 PM' },
  { id: 'O-1001', vehicle: 'TVS Apache RTR 200 2021', customer: 'Imran Khan', phone: '98765 90909', offerPrice: 122000, askingPrice: 135000, status: 'Pending', date: 'Jul 29, 12:40 PM' }
];

export type ContactStatus = 'New' | 'Replied';

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  date: string;
}

export const ADMIN_CONTACTS: AdminContact[] = [
  { id: 'C-1006', name: 'Divya Hegde', email: 'divya.h@gmail.com', phone: '98450 22110', subject: 'Test drive booking', message: 'Can I book a test drive for the Creta this weekend? I am free on Saturday morning.', status: 'New', date: 'Today, 8:55 AM' },
  { id: 'C-1005', name: 'Sanjay Reddy', email: 'sanjay.r@yahoo.com', phone: '99022 33445', subject: 'Selling my bike', message: 'I want to sell my 2020 Pulsar. What is the process and how long does it take?', status: 'New', date: 'Today, 8:10 AM' },
  { id: 'C-1004', name: 'Meera Iyer', email: 'meera.iyer@outlook.com', phone: '96110 88770', subject: 'Offer on my vehicle', message: 'My offer on the XUV700 was accepted. Who do I contact to finalise the paperwork?', status: 'Replied', date: 'Yesterday, 7:20 PM' },
  { id: 'C-1003', name: 'Rahul Verma', email: 'rahul.v@gmail.com', phone: '97400 11223', subject: 'Support', message: 'I am unable to log in to my account after changing my password.', status: 'Replied', date: 'Yesterday, 3:45 PM' },
  { id: 'C-1002', name: 'Kavya S', email: 'kavya.s@gmail.com', phone: '98860 99887', subject: 'Buying a vehicle', message: 'Do you offer EMI options on used cars? Looking at the Brezza.', status: 'Replied', date: 'Jul 30, 5:30 PM' },
  { id: 'C-1001', name: 'Naveen Kumar', email: 'naveen.k@gmail.com', phone: '99510 55678', subject: 'Test drive booking', message: 'I would like to test drive the Honda City CVT tomorrow afternoon.', status: 'Replied', date: 'Jul 30, 1:15 PM' }
];

export interface AdminNotification {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  { id: 'N-3', text: 'New offer received on Hyundai Creta SX (O)', time: '2 min ago', unread: true },
  { id: 'N-2', text: 'Divya Hegde requested a test drive', time: '1 hr ago', unread: true },
  { id: 'N-1', text: 'Offer O-1005 was accepted by Sneha Rao', time: '5 hrs ago', unread: true }
];

export interface BrandStat {
  brand: string;
  count: number;
}
