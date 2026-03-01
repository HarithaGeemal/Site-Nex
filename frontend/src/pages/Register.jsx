import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import SiteNexLogo from '../assets/logo.png';
import LoginBg from '../assets/login-background.jpg';

const Register = () => {
    return (
        <div
            className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${LoginBg})` }}
        >

            {/* Dark Gradient Overlay (stronger + premium look) */}
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-navy-dark/80 to-black/85 backdrop-blur-[2px]"></div>

            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center flex-col items-center text-center">

                    <img
                        src={SiteNexLogo}
                        alt="SiteNex Logo"
                        className="h-24 w-auto mb-6 drop-shadow-2xl"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />

                    <h2 className="text-4xl font-bold text-white tracking-wide drop-shadow-lg">
                        Join SiteNex
                    </h2>

                    <p className="mt-3 text-gray-300 text-sm tracking-wide">
                        Create your account
                    </p>
                </div>
            </div>

            {/* Register Card */}
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md z-10 flex justify-center">
                <SignUp
                    signInUrl="/login"
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                'bg-gold-DEFAULT hover:bg-gold-dark text-black font-semibold transition-all duration-200',
                            footerActionLink:
                                'text-navy-light hover:text-navy-DEFAULT'
                        }
                    }}
                />
            </div>

        </div>
    );
};

export default Register;
