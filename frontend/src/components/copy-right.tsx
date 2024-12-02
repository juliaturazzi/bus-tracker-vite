import React from "react"

const CopyRight: React.FC = () => {
  return (
    <div>
      <hr className="my-4 border-t" />
      <div className="text-left text-xs font-normal">
        &copy; Copyright {new Date().getFullYear()} Julia Turazzi - Bus Tracker
      </div>
      </div>
  )
}

export default CopyRight
  