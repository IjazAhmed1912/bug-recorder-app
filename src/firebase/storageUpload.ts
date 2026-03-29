import { getDownloadURL, ref, uploadString } from "firebase/storage"
import { storage } from "./config"

/**
 * Upload a PNG data URL to Storage under the reporter’s UID (required by security rules).
 */
export async function uploadIssueAsset(
  userUid: string,
  issueId: string,
  dataUrl: string,
  index: number
): Promise<string> {
  const path = `users/${userUid}/issues/${issueId}/capture-${Date.now()}-${index}.png`
  const r = ref(storage, path)
  await uploadString(r, dataUrl, "data_url")
  return getDownloadURL(r)
}
