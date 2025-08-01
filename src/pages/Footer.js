import React from 'react'
import { Link } from 'react-router-dom'
import { IoIosArrowForward } from "react-icons/io";
function Footer() {
  return (
    <div>
      <div className='bg-slate-800 motion-preset-slide-up-sm motion-'>
        <div className="py-20 mt-5 container-fluid bg-dark footer wow fadeIn ps-36" data-wow-delay="0.1s">
          <div className="flex flex-col text-gray-300 font-Lexend_Regular">
            <h4 className="mb-4 text-xl text-white motion-preset-fade-lg ">Quick Links</h4>
            <Link to={"/#home-section"} className='flex items-center '><IoIosArrowForward /> Home</Link>
            <Link to={"/#about-section"}className='flex items-center '><IoIosArrowForward /> About Us</Link>
            <Link to={"/#events-section"}className='flex items-center '><IoIosArrowForward /> Upcoming Events</Link>
            {/* <Link to={"RESOURCES"}className='flex items-center '><IoIosArrowForward /> Resources</Link> */}
          </div>
        </div>
      </div>
      <div className='flex flex-col items-center justify-center p-4 text-white bg-black font-Lexend_Regular '>
        <p>Website owned & maintained by: Centre for Development of Advanced Computing (C-DAC)</p>
        <p>© 2025 C-DAC. All rights reserved</p>
      </div>
    </div>
  )
}

export default Footer
