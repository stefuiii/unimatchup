import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { imageStore } from "../firebase-config";

export const uploadImage = async (file) => {
  const storageRef = ref(imageStore, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
};