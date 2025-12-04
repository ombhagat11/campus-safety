import React from 'react'

const NavBar = () => {
  return (
    <div>
         {/* NAVBAR */}
      <nav className="w-full px-6 py-4 bg-white dark:bg-gray-800 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">CampusSafety</h1>

        <div className="flex gap-4 items-center">
          <button className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            Login
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Report Incident
          </button>
        </div>
      </nav>
    </div>
  )
}

export default NavBar