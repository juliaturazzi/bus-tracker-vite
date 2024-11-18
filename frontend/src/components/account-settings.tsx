const AccountSettings = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Account Settings</h2>
        <form className="mt-4">
          <div className="mb-4">
            <label htmlFor="username" className="block">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="border rounded p-2 w-full"
            />
          </div>
          {/* Add more fields as needed */}
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
        </form>
      </div>
    );
  };
  