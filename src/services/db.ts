import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// The parent official website document key and deployment identity
export const PARENT_TEMPLATE_ID = "main 333";
export const OFFICIAL_APP_HASH = "t2ilutj4md24vn2jr5zc7g";

/**
 * Checks whether the current runtime environment is the Official Parent Website
 * (ais-dev-t2ilutj4md24vn2jr5zc7g-14313311583 or ais-pre-t2ilutj4md24vn2jr5zc7g-14313311583)
 */
export function isOfficialParentWebsite(): boolean {
  if (typeof window === "undefined") return true;
  const hostname = window.location.hostname || "";
  return hostname.includes(OFFICIAL_APP_HASH);
}

/**
 * Generates an automatic, unique, deterministic template ID for any remix deployment.
 * This guarantees that every remix has its own independent document and fields.
 */
export function getRemixAutoTemplateId(): string {
  if (typeof window === "undefined") return "remix_default";

  const hostname = window.location.hostname || "";

  // 1. Check if user already customized/saved a specific remix template name in this browser
  try {
    const saved = localStorage.getItem("remix_user_template_name");
    if (saved && saved.trim() && saved.trim() !== PARENT_TEMPLATE_ID && saved.trim() !== "main") {
      return saved.trim();
    }
  } catch {}

  // 2. Google AI Studio Remixes (Cloud Run run.app domains)
  if (hostname.includes(".run.app")) {
    const deploymentId = hostname
      .replace(/^ais-(dev|pre)-/, "")
      .replace(/\.asia-southeast1\.run\.app.*$/, "")
      .replace(/\.run\.app.*$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    if (deploymentId && !deploymentId.includes(OFFICIAL_APP_HASH)) {
      return `remix_${deploymentId}`;
    }
  }

  // 3. Vercel, Netlify, or custom hosting
  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    const sanitized = hostname.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `remix_${sanitized}`;
  }

  // 4. Local development fallback (localhost)
  try {
    let localId = localStorage.getItem("remix_local_template_id");
    if (!localId || localId === PARENT_TEMPLATE_ID || localId === "main") {
      localId = `remix_local_${Date.now().toString().slice(-4)}`;
      localStorage.setItem("remix_local_template_id", localId);
    }
    return localId;
  } catch {
    return "remix_local";
  }
}

/**
 * Computes an isolated template ID.
 * - On the official deployment: defaults to "main 333".
 * - On any remix: defaults to the remix's unique template ID.
 * - If ?template= is provided in query string:
 *   - On official deployment: allows any valid template name.
 *   - On a remix: NEVER allows "main 333" or "main" (redirects to the remix template).
 */
export function getDefaultTemplateId(): string {
  if (typeof window === "undefined") return PARENT_TEMPLATE_ID;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const param = searchParams.get("template");
    if (param && param.trim()) {
      const trimmed = param.trim();
      // On remixes, NEVER allow accessing or writing to main 333!
      if (!isOfficialParentWebsite() && (trimmed === PARENT_TEMPLATE_ID || trimmed === "main")) {
        return getRemixAutoTemplateId();
      }
      return trimmed;
    }
  } catch {}

  if (isOfficialParentWebsite()) {
    return PARENT_TEMPLATE_ID;
  }

  return getRemixAutoTemplateId();
}

/**
 * Retrieves wedding data for a template/remix partition.
 * If this remix partition document does not exist yet in Firestore,
 * it immediately creates a new separate document and fields, populated with
 * the complete copy of the parent website ("main 333") data.
 */
export async function getWeddingData(templateId?: string): Promise<WeddingData> {
  let currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();

  // Guard on remixes: never read from main 333 as the active editing target
  if (!isOfficialParentWebsite() && (currentTemplate === PARENT_TEMPLATE_ID || currentTemplate === "main")) {
    currentTemplate = getRemixAutoTemplateId();
  }

  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  try {
    const docRef = doc(db, "weddingConfig", safeTemplateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as WeddingData;
      return data;
    } else {
      // Document does NOT exist yet!
      // This is a brand new remix or newly created template section.
      // Automatically copy all data and fields from the parent website ("main 333")
      // so this remix inherits everything without overlapping.
      let sourceData: WeddingData = defaultData;

      try {
        const parentDocSnap = await getDoc(doc(db, "weddingConfig", PARENT_TEMPLATE_ID));
        if (parentDocSnap.exists()) {
          sourceData = parentDocSnap.data() as WeddingData;
        }
      } catch (err) {
        console.warn("Could not read parent template data, using bundled default data:", err);
      }

      // Deep clone to create a totally fresh independent data record
      const cleanData: any = JSON.parse(JSON.stringify(sourceData));
      
      // Metadata identifying this separate section
      cleanData._isRemix = safeTemplateId !== PARENT_TEMPLATE_ID;
      cleanData._templateId = safeTemplateId;
      cleanData._createdAt = new Date().toISOString();
      cleanData._parentTemplate = PARENT_TEMPLATE_ID;

      // Persist the copied data directly into this new remix's isolated document
      try {
        await setDoc(docRef, cleanData);
      } catch (saveErr) {
        console.error("Error creating initial document in Firestore:", saveErr);
      }

      return cleanData as WeddingData;
    }
  } catch (error) {
    console.error("Error fetching wedding data:", error);
    return defaultData;
  }
}

/**
 * Saves wedding data.
 * STRICT FIREWALL: On any remix, writing to "main 333" is completely blocked
 * and automatically diverted to the remix's own document in Firebase Firestore.
 */
export async function saveWeddingData(templateId: string, data: WeddingData): Promise<string> {
  let targetId = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();

  // HARDWARE FIREWALL: If not official website, BLOCK any write to main 333 or main
  if (!isOfficialParentWebsite() && (targetId === PARENT_TEMPLATE_ID || targetId === "main")) {
    console.warn("FIREWALL BLOCKED: Write to official parent website blocked on remix! Diverting to remix section.");
    targetId = getRemixAutoTemplateId();
  }

  const safeTemplateId = targetId.replace(/\//g, "-");
  const docRef = doc(db, "weddingConfig", safeTemplateId);

  // Sanitize data to remove any undefined fields that cause Firestore errors
  const cleanData: any = JSON.parse(JSON.stringify(data));
  cleanData._templateId = safeTemplateId;
  cleanData._updatedAt = new Date().toISOString();
  cleanData._isRemix = safeTemplateId !== PARENT_TEMPLATE_ID;

  await setDoc(docRef, cleanData);

  // If on a remix, persist this templateId in localStorage so all pages on this remix stay on this template
  if (!isOfficialParentWebsite()) {
    try {
      localStorage.setItem("remix_user_template_name", safeTemplateId);
    } catch {}
  }

  // If saving on the parent website, also keep the deployment URLs updated
  if (isOfficialParentWebsite() && safeTemplateId === PARENT_TEMPLATE_ID) {
    try {
      const backupIds = [
        "ais-dev-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app",
        "ais-pre-t2ilutj4md24vn2jr5zc7g-14313311583.asia-southeast1.run.app",
        "main"
      ];
      for (const backupId of backupIds) {
        setDoc(doc(db, "weddingConfig", backupId), cleanData).catch(() => {});
      }
    } catch {}
  }

  return safeTemplateId;
}

/**
 * Fetches all unique template / section document IDs stored in Firestore.
 */
export async function getAllTemplateIds(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, "weddingConfig"));
    const ids: string[] = [];
    snapshot.forEach(docSnap => {
      const id = docSnap.id;
      // Filter out raw hostname backup records to keep list clean and human-readable
      if (!id.includes(".run.app") && id !== "main 222") {
        ids.push(id);
      }
    });

    const isOfficial = isOfficialParentWebsite();
    const uniqueIds = Array.from(new Set(ids));
    
    if (isOfficial) {
      return Array.from(new Set([PARENT_TEMPLATE_ID, ...uniqueIds]));
    } else {
      const remixId = getRemixAutoTemplateId();
      return Array.from(new Set([remixId, ...uniqueIds]));
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [isOfficialParentWebsite() ? PARENT_TEMPLATE_ID : getRemixAutoTemplateId()];
  }
}

/**
 * Creates a brand new separate remix section and document in Firestore,
 * copying full data from parent "main 333" (or another source).
 */
export async function createNewRemixSection(customName?: string, sourceTemplateId: string = PARENT_TEMPLATE_ID): Promise<string> {
  const newName = (customName && customName.trim()) 
    ? customName.trim() 
    : `new remix template ${Math.floor(100 + Math.random() * 900)}`;
  const safeId = newName.replace(/\//g, "-");

  let seedData: WeddingData = defaultData;
  try {
    const sourceSnap = await getDoc(doc(db, "weddingConfig", sourceTemplateId));
    if (sourceSnap.exists()) {
      seedData = sourceSnap.data() as WeddingData;
    }
  } catch (err) {
    console.warn("Could not read source template, using defaults", err);
  }

  const cleanData: any = JSON.parse(JSON.stringify(seedData));
  cleanData._isRemix = true;
  cleanData._templateId = safeId;
  cleanData._createdAt = new Date().toISOString();
  cleanData._parentTemplate = sourceTemplateId;

  await setDoc(doc(db, "weddingConfig", safeId), cleanData);
  
  if (!isOfficialParentWebsite()) {
    try {
      localStorage.setItem("remix_user_template_name", safeId);
    } catch {}
  }

  return safeId;
}

/**
 * Submits an RSVP strictly tagged to this template/remix section.
 */
export async function submitRSVP(rsvpData: any, templateId?: string): Promise<void> {
  const currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  // Save to isolated subcollection inside weddingConfig/{templateId}/rsvps
  try {
    const subCol = collection(db, "weddingConfig", safeTemplateId, "rsvps");
    await addDoc(subCol, {
      ...rsvpData,
      templateId: safeTemplateId,
      submittedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Could not write to template subcollection:", err);
  }

  // Also write to global rsvps collection with templateId for backwards compatibility
  try {
    const rsvpCollection = collection(db, "rsvps");
    await addDoc(rsvpCollection, {
      ...rsvpData,
      templateId: safeTemplateId,
      submittedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error submitting RSVP globally:", err);
  }
}

/**
 * Fetches RSVPs specifically for this template/remix so lists don't overlap.
 */
export async function getRSVPs(templateId?: string): Promise<any[]> {
  const currentTemplate = (templateId && templateId.trim()) ? templateId.trim() : getDefaultTemplateId();
  const safeTemplateId = currentTemplate.replace(/\//g, "-");

  try {
    // Check isolated subcollection first
    const subCol = collection(db, "weddingConfig", safeTemplateId, "rsvps");
    const subSnap = await getDocs(subCol);
    if (!subSnap.empty) {
      return subSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    }

    // Fallback: query global rsvps collection and filter for this templateId
    const rsvpCollection = collection(db, "rsvps");
    const snapshot = await getDocs(rsvpCollection);
    return snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((item: any) => {
        if (safeTemplateId === PARENT_TEMPLATE_ID) {
          return !item.templateId || item.templateId === PARENT_TEMPLATE_ID;
        }
        return item.templateId === safeTemplateId;
      });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return [];
  }
}
