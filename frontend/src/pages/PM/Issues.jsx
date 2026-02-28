import React, { useState } from 'react';
import { issues } from '../../../assets/dummyData';

const Issues = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Issues</h1>
            <p>Review and resolve issues submitted by site engineers (including high priority blockers).</p>
        </div>
    );
};

export default Issues;
