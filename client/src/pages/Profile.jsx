import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase.js";
import {
  userDeleteFailure,
  userDeleteStart,
  userDeleteSuccess,
  userSignOutStart,
  userUpdateFailure,
  userUpdateStart,
  userUpdateSuccess,
} from "../redux/user/userSlice.js";
import { Link } from "react-router-dom";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadErr, setFileUploadErr] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(userUpdateStart());
      const result = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await result.json();
      if (data.success === false) {
        dispatch(userUpdateFailure(data.message));
        return;
      }
      dispatch(userUpdateSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(userUpdateFailure(error.message));
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(userDeleteStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(userDeleteFailure(data.message));
        return;
      }
      dispatch(userDeleteSuccess(data));
    } catch (error) {
      dispatch(userDeleteFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(userSignOutStart());
      const res = await fetch(`/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(userDeleteFailure(data.message));
        return;
      }
      dispatch(userDeleteSuccess(data));
    } catch (error) {
      dispatch(userDeleteFailure(error.message));
    }
  };

  const handleShowListings = async (e) => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingError(data.message);
      }
      setUserListings(data);
    } catch (error) {
      setShowListingError(error.message);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 && (Size less than 2MB)
  // request.resource.contentType.matches('image/.*') (Accept only Images)
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-6 font-semibold">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          defaultValue={currentUser.username}
          onChange={handleChange}
          className="rounded-lg p-3 border"
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
          className="rounded-lg p-3 border"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="rounded-lg p-3 border"
        />

        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 uppercase rounded-lg hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          to="/create-listing"
          className="bg-green-700 text-white text-center rounded-lg p-3 uppercase hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>
      <div className="flex mt-2 justify-between">
        <span className="text-red-700 cursor-pointer" onClick={handleDelete}>
          Delete account
        </span>
        <span className="text-red-700 cursor-pointer" onClick={handleSignOut}>
          Sign out
        </span>
      </div>
      <p className="text-red-700 mt-2">{error && error}</p>
      <p className="text-green-700 mt-2">
        {updateSuccess && "User updated successfully!"}
      </p>
      <button className="text-green-700 w-full" onClick={handleShowListings}>
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingError ? "Error showing listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-3xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => {
            return (
              <div
                key={listing._id}
                className="flex border rounded-lg p-3 justify-between gap-4 items-center"
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt="listing-cover"
                    className="w-16 h-16 object-contain"
                  />
                </Link>
                <Link
                  to={`/listing/${listing._id}`}
                  className="font-semibold flex-1 text-slate-700 hover:underline truncate"
                >
                  {listing.name}
                </Link>

                <div className="flex flex-col items-center">
                  <button
                    className="text-red-700 uppercase"
                    onClick={() => handleDeleteListing(listing._id)}
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className="text-green-700 uppercase">Edit</button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
