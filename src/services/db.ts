import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

const DATA_DOC_ID = "main";

export async function getWeddingData(templateId: string = "main"): Promise<WeddingData> {
  try {
    const docRef = doc(db, "weddingConfig", templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as WeddingData;
      // Schema migration: If the first event doesn't have a hashtag (meaning it's the old structure),
      // we inject the newly requested default events data so it appears on the website.
      if (data.events && data.events.length > 0 && data.events[0].hashtag === undefined) {
        data.events = defaultData.events;
      }
      return data;
    } else {
      // Initialize with default data if none exists and it's the main template
      if (templateId === "main") {
        await setDoc(docRef, defaultData);
      }
      return defaultData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData; // Fallback
  }
}

export async function saveWeddingData(templateId: string, data: WeddingData): Promise<void> {
  // Replace slashes just in case they typed a path-like string
  const safeTemplateId = templateId.replace(/\//g, "-");
  const docRef = doc(db, "weddingConfig", safeTemplateId);
  // Sanitize data to remove any undefined fields that cause Firestore errors
  const cleanData = JSON.parse(JSON.stringify(data));
  await setDoc(docRef, cleanData);
}

export async function submitRSVP(rsvpData: any): Promise<void> {
  const rsvpCollection = collection(db, "rsvps");
  await addDoc(rsvpCollection, {
    ...rsvpData,
    submittedAt: new Date().toISOString()
  });
}

export async function getRSVPs(): Promise<any[]> {
  try {
    const rsvpCollection = collection(db, "rsvps");
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
