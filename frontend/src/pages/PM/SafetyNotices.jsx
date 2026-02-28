import React, { useState } from 'react';
import { safetyObservations, stopHoldNotices } from '../../../assets/dummyData';

const SafetyNotices = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Safety & Notices</h1>
            <p>View safety observations and stop/hold notices from the safety officer here.</p>
        </div>
    );
};

export default SafetyNotices;
