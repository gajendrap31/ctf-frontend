import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IoMdArrowRoundForward } from "react-icons/io";
import { IoMdArrowRoundBack } from "react-icons/io";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
const AboutUs=()=> {
  return (
    <div className=''  id="about-section" >
      <div className='px-4 mt-10 space-y-10 sm:px-6 md:px-14 lg:px-24 xl:px-48 2xl:px-72'>

        <div
          className="relative flex flex-col items-center justify-end min-h-screen overflow-hidden transition-all duration-700 bg-center bg-no-repeat bg-cover lg:flex-row sm:items-end sm:justify-end motion-scale-in-95"
          style={{ backgroundImage: "url('/cdac.jpg')" }}
        >
          <div className="w-11/12 px-6 py-10 m-0 bg-white rounded-t-lg shadow-lg sm:w-3/5 2xl:w-2/5 sm:me-4 font-Lexend_Regular md:px-10 lg:me-8 motion-preset-slide-left-md">
            <h1 className="mb-2 text-xl text-blue-500 sm:text-2xl font-Lexend_SemiBold">About Us</h1>
            <h3 className="mb-4 text-2xl sm:text-3xl font-Lexend_Bold">CDAC</h3>
            <hr className="mb-4 border-t border-gray-300" />
            <p className="text-base leading-relaxed text-justify text-gray-600">
              Centre for Development of Advanced Computing (C-DAC) is the premier R&D organization of the Ministry of Electronics and Information Technology (MeitY) for carrying out R&D in IT, Electronics, and associated areas.
              Different areas of C-DAC originated at different times, many emerging from key opportunity identification.
              The C-DAC Noida (formerly ER&DCI, Noida) has been a part of C-DAC since 1994, working in application-oriented design for various customer needs.
              It has developed expertise in Strategic Electronics & Embedded Systems, Cyber Security, Health Informatics, e-Governance, and Multilingual Computing.
            </p>

            <div className="mt-6">
              <a
                href="https://www.cdac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 text-white transition bg-blue-600 rounded-full hover:bg-blue-700 font-Lexend_SemiBold"
              >
                Learn More About C-DAC
              </a>
            </div>
          </div>
        </div>


        <div className='justify-center w-full pt-20 pb-4 space-y-4 text-justify font-Lexend_Regular' id='CTF_details'>
          <h3 className='text-xl text-blue-600 font-Lexend_Regular'>Capture The Flag (CTF)</h3>

          <p className='text-sm text-gray-500'>CDAC CTF platform is a specialized environment designed for cybersecurity enthusiasts, learners, and professionals.</p>
          <h2 className='my-2 text-lg text-center text-blue-600 font-Lexend_Regular'>Key Areas of Coverage</h2>
          <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3 md:px-12 font-Lexend_Regular">
            {[
              {
                title: "Web Security",
                desc: "Exploiting vulnerabilities like SQL injection, cross-site scripting (XSS), and more",
                img: "img/icon/websec.png",
              },
              {
                title: "Cryptography",
                desc: "Decoding and breaking encryption algorithms.",
                img: "img/icon/cpto2.png",
              },
              {
                title: "Reverse Engineering",
                desc: "Analyzing compiled binaries to understand their function and exploit weaknesses.",
                img: "img/icon/iconres.png",
              },
              {
                title: "Forensics",
                desc: "Recovering and analyzing data from files, networks, and systems.",
                img: "img/icon/cyber2.png",
              },
              {
                title: "Networking",
                desc: "Capturing network traffic, analyzing protocols, and finding vulnerabilities in communication systems.",
                img: "img/icon/networking1.png",
              },
              {
                title: "Malware",
                desc: "Detecting and recognizing malware and more…",
                img: "img/icon/iconmal.png",
              },
            ].map((item, index) => (
              <ScrollFadeIn key={index} delay={index * 0.1}>
                <div className="flex flex-col items-center h-full p-6 text-center transition bg-white border shadow-sm rounded-xl hover:shadow-md">
                  <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <img src={item.img} alt={item.title} className="object-contain w-12 h-12" />
                  </div>
                  <h5 className="mb-2 text-xl font-Lexend_SemiBold">{item.title}</h5>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>


          <h3 className='text-xl text-blue-600 font-Lexend_Regular'>Key Features</h3>

          <p className='w-full mt-2 mb-4 border'></p>
          <ProjectCarousel />
        </div>
      </div>
    </div>
  );
}

const ScrollFadeIn = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 40 },
      }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};
const projects = [
  {
    image: 'img/intl.jpg',
    title: 'Interactive Learning',
    description: 'Hands-on challenges that provide real-time feedback and guidance.',
    viewImg: 'img/project-1.jpg',
  },
  {
    image: 'img/comp.jpg',
    title: 'Competitive and Collaborative',
    description: 'Engage in individual and team-based competitions to test and refine skills.',
    viewImg: 'img/project-2.jpg',
  },
  {
    image: 'img/skill.png',
    title: 'Skill Progression',
    description: 'Challenges are structured to accommodate beginners while offering advanced scenarios for experienced users.',
    viewImg: 'img/project-3.jpg',
  },
  {
    image: 'img/Realworld.png',
    title: 'Real-World Scenarios',
    description: 'Simulated attack and defense environments that reflect real-world cybersecurity threats.',
    viewImg: 'img/Realworld.png',
  },
];
const ProjectCarousel = () => {
  return (
    <div className="w-full px-4 py-4">
      <div className="relative w-full h-full bg-opacity-70">
        {/* Custom Navigation Buttons */}
        <div className="absolute z-10 flex justify-between top-4 left-4 right-4 md:top-0 md:left-10 md:right-10">
          <button className="p-2 text-gray-800 transition bg-white rounded-full shadow-md custom-swiper-prev hover:bg-white/70">
            <IoMdArrowRoundBack size={20} />
          </button>
          <button className="p-2 text-gray-800 transition bg-white rounded-full shadow-md custom-swiper-next hover:bg-white/70">
            <IoMdArrowRoundForward size={20} />
          </button>
        </div>

        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: ".custom-swiper-next",
            prevEl: ".custom-swiper-prev",
          }}
          touchRatio={1}
          autoplay={{ delay: 3000 }}
          simulateTouch={true}
          loop
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="px-5"
        >
          {projects.map((project, index) => (
            <SwiperSlide key={index}>
              <FadeInWhenVisible delay={index * 0.2}>
                <div className="mt-16 mb-2 overflow-hidden bg-white rounded-lg shadow-md">
                  <div className="relative overflow-hidden group">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="object-cover w-full h-56 motion-preset-slide-up"
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100">
                      <a
                        href={project.image}
                        className="p-3 m-1 text-black bg-white rounded-full"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <i className="fa fa-eye"></i>
                      </a>
                      <a href="#" className="p-3 m-1 text-black bg-white rounded-full">
                        <i className="fa fa-link"></i>
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-xl font-semibold motion-preset-slide-left">{project.title}</h3>
                    <p className="text-sm text-gray-600 motion-preset-rebound-up">{project.description}</p>
                  </div>
                </div>
              </FadeInWhenVisible>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
const FadeInWhenVisible = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.8, delay }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 40 },
      }}
    >
      {children}
    </motion.div>
  );
};



export default AboutUs;
