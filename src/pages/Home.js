import React from 'react'
import Navbar from './Navbar'
import { Link, useLocation } from 'react-router-dom';
import AboutUs from './AboutUs';
import UpComingEvents from './UpComingEvents';
import Resources from './Resources';
import Footer from './Footer';

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { IoMdArrowRoundForward } from "react-icons/io";
import { IoMdArrowRoundBack } from "react-icons/io";
const Home = () => {

  const [activeSection, setActiveSection] = useState("");
  const [visibleSections, setVisibleSections] = useState({
    home: true,
    about: true,
    events: false,
    resources: false,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setActiveSection(id);

            setVisibleSections((prev) => ({
              ...prev,
              [id.split("-")[0]]: true,
            }));
          }
        });
      },
      { threshold: 0.2 }
    );

    const sectionElements = document.querySelectorAll("section");
    sectionElements.forEach((section) => observer.observe(section));

    return () => {
      sectionElements.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div>
      <Navbar activeSection={activeSection} />
      <div>
        <section id="home-section">{<HomePage />}</section>

        <section id="about-section">
          {visibleSections.about && <AboutUs />}
        </section>

        <section id="events-section">
          {visibleSections.events && <UpComingEvents />}
        </section>

        {/* <section id="resources-section">
          {visibleSections.resources && <Resources />}
        </section> */}
      </div>
      <Footer />
    </div>
  );
};

const scrollToHash = () => {
  const hash = window.location.hash;
  if (hash) {
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
};
const HomePage = () => {

  const location = useLocation();

  useEffect(() => {
    scrollToHash();
  }, [location]);

  return (

    <div className="flex flex-col items-center min-h-screen space-y-16 md:space-y-16" id="home-section">

      <CTFCarousel />
      {/* Second Section */}
      <div className="px-4 mx-auto space-y-10 text-lg text-gray-900 sm:px-6 md:px-14 lg:px-24 xl:px-48 2xl:px-72 font-Lexend_Regular">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {/* Card 1 */}
          <div className="p-6 transition bg-white border rounded-lg shadow hover:shadow-md motion-scale-x-in-0">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                <img src="/img/img2.png" alt="Join Us" className="object-contain w-12 h-12" />
              </div>
            </div>
            <h5 className="mb-2 text-xl text-center font-Lexend_SemiBold">Join Us</h5>
            <p className="text-base text-center text-gray-600">
              Join the Challenge. Be a Cybersecurity Champion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 transition bg-white border rounded-lg shadow hover:shadow-md motion-scale-y-in-0 ">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                <img src="/img/icon1.png" alt="Solve and Win" className="object-contain w-12 h-12" />
              </div>
            </div>
            <h5 className="mb-2 text-xl text-center font-Lexend_SemiBold">Solve and Win</h5>
            <p className="text-base text-center text-gray-600">
              Compete with the best and prove your cybersecurity expertise.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 transition bg-white border rounded-lg shadow hover:shadow-md motion-scale-x-in-0">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                <img src="/img/img7.jpg" alt="Sharpen Skills" className="object-contain w-12 h-12" />
              </div>
            </div>
            <h5 className="mb-2 text-xl text-center font-Lexend_SemiBold">Sharpen Your Skills</h5>
            <p className="text-base text-center text-gray-600">
              Solve challenges, sharpen your skills, and climb the leaderboard.
            </p>
          </div>

        </div>
      </div>


    </div>


  )
}



function CTFCarousel() {
  const slides = [
    {
      heading: 'Solve challenges in web security, cryptography, forensics, and more',
      image: '/img/img24.jpg',
    },
    {
      heading: 'Compete, test your skills, and enhance your cybersecurity expertise',
      image: '/img/img231.jpg',
    },
    {
      heading: 'Gain real-world experience by solving cybersecurity challenges',
      image: '/img/ctf1.png',
    },
  ];

  return (
    <div
      className="relative w-full mt-20 bg-center bg-cover sm:mt-20 "
      style={{ backgroundImage: `url(/img/banner-bg.png)` }}
    >
      <div className="relative w-full h-full">

        {/* Custom Navigation Buttons */}
        <div className="absolute z-10 flex justify-between top-4 left-4 right-4 md:top-10 md:left-10 md:right-10">
          <button className="p-2 text-gray-800 transition bg-white rounded-full shadow custom-swiper-prev hover:bg-white/70">
            <IoMdArrowRoundBack size={20} />
          </button>
          <button className="p-2 text-gray-800 transition bg-white rounded-full shadow custom-swiper-next hover:bg-white/70">
            <IoMdArrowRoundForward size={20} />
          </button>
        </div>

        <Swiper
          modules={[Navigation, Autoplay, EffectFade]}
          navigation={{
            nextEl: ".custom-swiper-next",
            prevEl: ".custom-swiper-prev",
          }}
          autoplay={{ delay: 4000 }}
          loop
          effect="fade"
          className="h-[500px] md:h-[500px] "
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="container flex items-center h-full px-4 pt-20 pb-10 mx-auto font-Lexend_Regular sm:pt-10">
                <div className="grid items-center grid-cols-1 gap-8 text-center md:grid-cols-2 md:text-left">

                  {/* Text Section */}
                  <div className="space-y-4 animate-fade-in-left">
                    <h1 className="text-2xl font-bold text-white md:text-4xl motion-preset-blur-left-lg">
                      {slide.heading}
                    </h1>
                    <div className="flex items-center justify-center gap-4 md:justify-start">
                      <Link
                        to="/#CTF_details"
                        className="px-5 py-2 text-gray-900 transition bg-white rounded-full hover:bg-gray-200 motion-preset-rebound-up"
                      >
                        Learn More
                      </Link>
                      <Link
                        to="/sign_up"
                        className="px-5 py-2 text-white border border-white rounded-full hover:bg-white hover:text-gray-900 motion-preset-rebound-up "
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="animate-fade-in-right motion-preset-blur-left-lg">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="mx-auto w-full max-h-[200px] md:max-h-[300px] object-contain"
                    />
                  </div>

                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );



}







export default Home
