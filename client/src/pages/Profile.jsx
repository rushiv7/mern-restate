import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadErr, setFileUploadErr] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadErr(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFormData({ ...formData, avatar: url });
        });
      }
    );
  };

  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 && (Size less than 2MB)
  // request.resource.contentType.matches('image/.*') (Accept only Images)
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-6 font-semibold">Profile</h1>
      <form className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          accept="image/*"
          ref={fileRef}
          hidden
        />
        <img
          src={formData.avatar || currentUser.avatar}
          onClick={() => fileRef.current.click()}
          className="rounded-full cursor-pointer mt-2 h-24 w-24 self-center object-cover"
          alt="Profile"
        />
        <p className="text-center">
          {fileUploadErr ? (
            <span className="text-red-700">
              Error image upload. (Image size must be less than 2mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span>{`Uploaded ${filePerc}%`}</span>
          ) : filePerc == 100 && !fileUploadErr ? (
            <span className="text-green-700">File uploaded successfully!</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          id="username"
          className="rounded-lg p-3 border"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          className="rounded-lg p-3 border"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="rounded-lg p-3 border"
        />

        <button className="bg-slate-700 text-white p-3 uppercase rounded-lg hover:opacity-95 disabled:opacity-80">
          Update
        </button>
      </form>
      <div className="flex mt-2 justify-between">
        <span className="text-red-700 cursor-pointer">Delete account</span>
        <span className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
}
