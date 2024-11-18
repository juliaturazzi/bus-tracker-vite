import React from "react"

const CopyRight: React.FC = () => {
  return (
    <div className="mb-7">
      <hr className="my-4 border-t border-gray-300" />
      <div className="text-left text-xs font-normal text-gray-500">
        &copy; Copyright {new Date().getFullYear()} Julia - Bus Tracker
      </div>
      </div>
  )
}

export default CopyRight
