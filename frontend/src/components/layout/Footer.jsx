import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Tagline */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-base">
              <div className="w-11 h-11 overflow-hidden rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src={logo}
                  alt="LaunchPad"
                  className="w-full h-full object-contain scale-[1.8]"
                />
              </div>
              LaunchPad
            </Link>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              Highlighting student innovations and connecting future-ready builders with top-tier recruiters.
            </p>
          </div>

          {/* Copyright & Info */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} LaunchPad. Built for developers & innovators.
            </p>
            <div className="flex space-x-4 text-xs text-gray-500">
              <Link to="/" className="hover:text-indigo-400 transition-colors">
                Home
              </Link>
              <span>&bull;</span>
              <Link to="/projects" className="hover:text-indigo-400 transition-colors">
                Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
