import { useSelector } from "react-redux";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center my-6 font-semibold">Profile</h1>
      <form className="flex flex-col gap-4">
        <img
          src={currentUser.avatar}
          className="rounded-full cursor-pointer mt-2 h-24 w-24 self-center object-cover"
          alt="Profile"
        />
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
