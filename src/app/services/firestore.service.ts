import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface FlightInfoPayload {
  userFullName: string;
  mailingAddress: string;
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
  uid: string;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);

  private collectionName = 'FlightInfoPayload';

  addFlightInfoPayload(travelData: FlightInfoPayload): Promise<any> {
    const travelCollection = collection(this.firestore, this.collectionName);
    return addDoc(travelCollection, travelData);
  }

  async getUserFlightRequests(userUID: string): Promise<FlightInfoPayload[]> {
    const flightCollection = collection(this.firestore, this.collectionName);
    const q = query(flightCollection, where('uid', '==', userUID));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as FlightInfoPayload);
  }
}
