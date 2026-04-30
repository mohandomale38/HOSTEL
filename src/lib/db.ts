import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const LOCAL_USERS_KEY = 'stayeaseUsers';
const LOCAL_ROOMS_KEY = 'stayeaseRooms';

const DEFAULT_USERS: Record<string, any> = {
  'prithviraj@gmail.com': {
    id: 'prithviraj@gmail.com',
    userId: 'prithviraj@gmail.com',
    name: 'Prithviraj',
    email: 'prithviraj@gmail.com',
    mobile: '9876543210',
    roomNo: '101',
    password: 'resident123',
    role: 'resident',
    avatarUrl: null,
    createdAt: '2026-04-01T08:00:00.000Z',
    isVerified: true,
  },
  'radhika.patel@example.com': {
    id: 'radhika.patel@example.com',
    userId: 'radhika.patel@example.com',
    name: 'Radhika Patel',
    email: 'radhika.patel@example.com',
    mobile: '9123456780',
    roomNo: '102',
    password: 'resident123',
    role: 'resident',
    avatarUrl: null,
    createdAt: '2026-03-22T12:00:00.000Z',
    isVerified: true,
  },
};

const DEFAULT_ROOMS = [
  { id: 'room-101', number: '101', type: 'Single', rent: 12000, capacity: 1, occupancy: 1, status: 'Full' },
  { id: 'room-102', number: '102', type: 'Double', rent: 8500, capacity: 2, occupancy: 1, status: 'Available' },
  { id: 'room-201', number: '201', type: 'Double', rent: 8500, capacity: 2, occupancy: 2, status: 'Full' },
  { id: 'room-202', number: '202', type: 'Triple', rent: 6500, capacity: 3, occupancy: 1, status: 'Available' },
];

function getLocalUsers() {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
  }
  const parsed = JSON.parse(raw);
  if (!parsed || Object.keys(parsed).length === 0) {
    window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return { ...DEFAULT_USERS };
  }
  return parsed;
}

function saveLocalUsers(users: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getLocalRooms() {
  if (typeof window === 'undefined') return DEFAULT_ROOMS;
  const raw = window.localStorage.getItem(LOCAL_ROOMS_KEY);
  if (!raw) {
    window.localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(DEFAULT_ROOMS));
    return [...DEFAULT_ROOMS];
  }
  const parsed = JSON.parse(raw);
  if (!parsed || parsed.length === 0) {
    window.localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(DEFAULT_ROOMS));
    return [...DEFAULT_ROOMS];
  }
  return parsed;
}

function saveLocalRooms(rooms: any[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
}

function isFirestorePermissionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Missing or insufficient permissions') || message.includes('permission_denied');
}

export async function getUserProfile(uid: string) {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      const users = getLocalUsers();
      return users[uid] || null;
    }
    handleFirestoreError(e, OperationType.GET, `users/${uid}`);
  }
}

export async function createUserProfile(uid: string, data: any) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      isVerified: false,
    });
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      const users = getLocalUsers();
      users[uid] = {
        ...data,
        id: uid,
        createdAt: new Date().toISOString(),
        isVerified: false,
      };
      saveLocalUsers(users);
      return;
    }
    handleFirestoreError(e, OperationType.CREATE, `users/${uid}`);
  }
}

export async function getRooms() {
  try {
    const q = query(collection(db, 'rooms'), orderBy('number'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      return getLocalRooms();
    }
    handleFirestoreError(e, OperationType.LIST, 'rooms');
  }
}

export async function raiseComplaint(userId: string, data: any) {
  try {
    await addDoc(collection(db, 'complaints'), {
      ...data,
      userId,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'complaints');
  }
}

export async function getMyComplaints(userId: string) {
  try {
    const q = query(collection(db, 'complaints'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'complaints');
  }
}

export async function getNotices() {
  try {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'notices');
  }
}

export async function getMyPayments(userId: string) {
  try {
    const q = query(collection(db, 'payments'), where('userId', '==', userId), orderBy('year', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'payments');
  }
}

export async function updateComplaintStatus(complaintId: string, status: string) {
  try {
    const docRef = doc(db, 'complaints', complaintId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `complaints/${complaintId}`);
  }
}

export async function getAllComplaints() {
  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'complaints');
  }
}

export async function addNotice(data: any) {
  try {
    await addDoc(collection(db, 'notices'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'notices');
  }
}

export async function addRoom(data: any) {
  try {
    await addDoc(collection(db, 'rooms'), {
      ...data,
      occupancy: 0,
      status: 'Available',
    });
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      const rooms = getLocalRooms();
      rooms.push({
        id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ...data,
        occupancy: 0,
        status: 'Available',
      });
      saveLocalRooms(rooms);
      return;
    }
    handleFirestoreError(e, OperationType.CREATE, 'rooms');
  }
}

export async function updateRoom(roomId: string, data: any) {
  try {
    const docRef = doc(db, 'rooms', roomId);
    await updateDoc(docRef, data);
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      const rooms = getLocalRooms().map((room: any) => room.id === roomId ? { ...room, ...data } : room);
      saveLocalRooms(rooms);
      return;
    }
    handleFirestoreError(e, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

export async function makePayment(userId: string, amount: number, month: string, year: number) {
  try {
    await addDoc(collection(db, 'payments'), {
      userId,
      amount,
      month,
      year,
      status: 'Paid',
      method: 'Google Pay (Mock)',
      transactionId: `STAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'payments');
  }
}

export async function getAllPayments() {
  try {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'payments');
  }
}

export async function getAllUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    if (isFirestorePermissionError(e)) {
      return Object.values(getLocalUsers());
    }
    handleFirestoreError(e, OperationType.LIST, 'users');
  }
}

export async function submitFeedback(userId: string, data: any) {
  try {
    await addDoc(collection(db, 'feedback'), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, 'feedback');
  }
}

export async function getFeedbacks() {
  try {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'feedback');
  }
}

export async function allocateRoom(roomId: string, userId: string) {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const userRef = doc(db, 'users', userId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      const newOccupancy = (roomData.occupancy || 0) + 1;
      const newStatus = newOccupancy >= roomData.capacity ? 'Full' : 'Available';
      
      await updateDoc(roomRef, {
        occupancy: newOccupancy,
        status: newStatus
      });
      
      await updateDoc(userRef, {
        roomId: roomId
      });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

export async function seedInitialData() {
  const rooms = await getRooms();
  if (rooms && rooms.length === 0) {
    const initialRooms = [
      { number: '101', type: 'Single', rent: 12000, capacity: 1, occupancy: 0, status: 'Available' },
      { number: '102', type: 'Double', rent: 8500, capacity: 2, occupancy: 1, status: 'Available' },
      { number: '201', type: 'Double', rent: 8500, capacity: 2, occupancy: 2, status: 'Full' },
      { number: '202', type: 'Triple', rent: 6500, capacity: 3, occupancy: 1, status: 'Available' },
    ];
    for (const r of initialRooms) {
      await addDoc(collection(db, 'rooms'), r);
    }
    
    await addDoc(collection(db, 'notices'), {
      title: 'Welcome to StayEase!',
      content: 'We are excited to have you here. Please complete your profile and room details.',
      priority: 'Low',
      authorId: 'system',
      createdAt: serverTimestamp()
    });
  }
}

