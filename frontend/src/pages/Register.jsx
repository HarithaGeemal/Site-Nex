import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import SiteNexLogo from '../assets/logo.png';
import VideoBackground from '../components/VideoBackground';

const Register = () => {
    return (
        <VideoBackground>
            {/* Header Section */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md flex justify-center">
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
        </VideoBackground>
    );
};

export default Register;
