import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram, 
  FaReddit,
  FaDiscord,
  FaYoutube,
  FaChevronUp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa';

const FooterLink = ({ href, icon, text }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span 
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl"
      >
        {icon}
      </motion.span>
      <span>{text}</span>
    </motion.a>
  );
};

const HustleHubFooter = () => {
  const socialLinks = [
    { href: "https://github.com/CAPTAINRAJ19", icon: <FaGithub />, text: "Github" },
    { href: "https://www.linkedin.com/in/dhruv-raj-singh-05b1a7248/", icon: <FaLinkedin />, text: "LinkedIn" },
    { href: "https://x.com/DhruvRa48929519", icon: <FaTwitter />, text: "Twitter" },
    { href: "https://www.instagram.com/captainraj_19/", icon: <FaInstagram />, text: "Instagram" },
    { href: "https://www.reddit.com/user/CaptainRaj_19/", icon: <FaReddit />, text: "Reddit" },
    { href: "https://discordapp.com/users/captainraj_19_60391/", icon: <FaDiscord />, text: "Discord" },
    { href: "https://www.youtube.com/@dhruvrajsingh9055", icon: <FaYoutube />, text: "YouTube" },
  ];

  const contactInfo = [
    { icon: <FaPhone />, text: "7880558166", display: "📞 +91 7880558XXX" },
    { icon: <FaEnvelope />, text: "dhruvrajsingh.1019@gmail.com", display: "📧 dhruvrajsingh.1019@gmail.com" },
    { icon: <FaEnvelope />, text: "dhruvrajsingh_22191@aitpune.edu.in", display: "📧 dhruvrajsingh_22191@aitpune.edu.in" },
    { icon: <FaMapMarkerAlt />, text: "Army Institute of Technology, Alandi rd Dighi 411015, Pune, Maharashtra", display: "🏠 Location" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-purple-100">
      {/* Wave Separator */}
      <div className="relative h-16">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 left-0 w-full">
          <path fill="#581c87" fillOpacity="1" d="M0,128L48,138.7C96,149,192,171,288,176C384,181,480,171,576,144C672,117,768,75,864,74.7C960,75,1056,117,1152,133.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-6 pt-8 pb-12 bg-purple-900">
        {/* Logo and Scroll to Top */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
              HustleHub
            </span>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="p-2 rounded-full bg-purple-700 hover:bg-purple-600 text-white transition-colors duration-300"
          >
            <FaChevronUp />
          </motion.button>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">About HustleHub</h3>
            <p className="text-purple-200 mb-4">
              Your digital gateway to productivity and growth. We help you transform your hustle into success with cutting-edge tools and resources.
            </p>
          </div>
          
          {/* Social Links Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Connect With Me</h3>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((link, index) => (
                <FooterLink key={index} {...link} />
              ))}
            </div>
          </div>
          
          {/* Contact Information with Copy-to-Clipboard */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Contact Information</h3>
            <ul className="space-y-2">
              {contactInfo.map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(item.text);
                    alert(`Copied: ${item.text}`);
                  }}
                >
                  <span className="text-purple-400">{item.icon}</span>
                  <span className="text-purple-200">
                    {index === 0 ? "📞 +91 7880558XXX" : item.display}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-purple-800 via-purple-400 to-purple-800 my-8"></div>
        
        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-purple-300">
            © {new Date().getFullYear()} HustleHub. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <a href="#" className="text-purple-300 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-purple-300 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-purple-300 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HustleHubFooter;
