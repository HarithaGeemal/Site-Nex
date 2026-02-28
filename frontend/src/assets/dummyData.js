export const projects = [
  {
    id: "PROJ-101",
    name: "Skyview Commercial Complex",
    location: "Downtown Metropolis",
    startDate: "2025-01-15",
    estimatedEndDate: "2026-08-30",
    budget: 45000000,
    status: "In Progress", // Options: Planning, In Progress, On Hold, Completed
    progress: 35, // percentage
    projectManager: "Alice Johnson",
    siteEngineer: "Bob Smith",
    description: "A 15-story mixed-use commercial complex featuring retail spaces and corporate offices."
  },
  {
    id: "PROJ-102",
    name: "Riverfront Residences",
    location: "Westside Marina",
    startDate: "2025-06-01",
    estimatedEndDate: "2027-02-15",
    budget: 85000000,
    status: "Planning",
    progress: 5,
    projectManager: "David Lee",
    siteEngineer: "Carol White",
    description: "Premium residential apartments with 200 units, a clubhouse, and riverfront amenities."
  }
];

export const tasks = [
  {
    id: "TASK-401",
    projectId: "PROJ-101",
    name: "Foundation Concrete Pouring",
    description: "Pour concrete for the main foundation raft.",
    assignedTo: ["WRK-001", "WRK-002", "WRK-005"],
    startDate: "2026-03-01",
    endDate: "2026-03-03",
    status: "In Progress", // Options: To Do, In Progress, Completed, Blocked
    priority: "High" // Options: Low, Medium, High, Critical
  },
  {
    id: "TASK-402",
    projectId: "PROJ-101",
    name: "Steel Reinforcement Setup",
    description: "Install rebar for the ground floor columns.",
    assignedTo: ["WRK-003", "WRK-004"],
    startDate: "2026-03-04",
    endDate: "2026-03-08",
    status: "To Do",
    priority: "High"
  },
  {
    id: "TASK-403",
    projectId: "PROJ-102",
    name: "Site Clearing and Grading",
    description: "Clear vegetation and grade land for initial survey.",
    assignedTo: ["WRK-006", "WRK-007"],
    startDate: "2025-06-05",
    endDate: "2025-06-15",
    status: "Completed",
    priority: "Medium"
  }
];

export const workers = [
  {
    id: "WRK-001",
    name: "John Doe",
    role: "Foreman",
    trade: "General Construction",
    phone: "555-0101",
    status: "Active" // Options: Active, On Leave, Inactive
  },
  {
    id: "WRK-002",
    name: "Mike Sanchez",
    role: "Skilled Worker",
    trade: "Concrete Finisher",
    phone: "555-0102",
    status: "Active"
  },
  {
    id: "WRK-003",
    name: "Sarah Jenkins",
    role: "Skilled Worker",
    trade: "Ironworker (Rebar)",
    phone: "555-0103",
    status: "Active"
  },
  {
    id: "WRK-004",
    name: "Tom Nguyen",
    role: "Skilled Worker",
    trade: "Ironworker (Rebar)",
    phone: "555-0104",
    status: "On Leave"
  },
  {
    id: "WRK-005",
    name: "James Miller",
    role: "Operator",
    trade: "Heavy Machinery",
    phone: "555-0105",
    status: "Active"
  },
  {
    id: "WRK-006",
    name: "Peter Clark",
    role: "Skilled Worker",
    trade: "Earthworks",
    phone: "555-0106",
    status: "Active"
  },
  {
    id: "WRK-007",
    name: "Luis Gomez",
    role: "General Laborer",
    trade: "Site Prep",
    phone: "555-0107",
    status: "Active"
  }
];

export const issues = [
  {
    id: "ISS-201",
    projectId: "PROJ-101",
    title: "Delayed Delivery of Structural Steel",
    description: "Supplier reported a 3-day delay in shipping the I-beams for the first floor due to logistics issues.",
    reportedBy: "Bob Smith", // Site Engineer
    reportedDate: "2026-02-26",
    status: "Open", // Options: Open, In Progress, Resolved, Closed
    priority: "High", // Should block progress bar
    attachments: ["delayschedule.pdf"]
  },
  {
    id: "ISS-202",
    projectId: "PROJ-101",
    title: "Water Pump Malfunction",
    description: "Dewatering pump on zone B stopped working. Needs immediate replacement or repair.",
    reportedBy: "Bob Smith",
    reportedDate: "2026-02-28",
    status: "Resolved",
    priority: "Medium",
    attachments: []
  },
  {
    id: "ISS-203",
    projectId: "PROJ-102",
    title: "Permit Clearance Delay",
    description: "Municipal clearance for excavation is taking longer than expected.",
    reportedBy: "Carol White",
    reportedDate: "2025-06-10",
    status: "Open",
    priority: "Critical", // Definite blocker
    attachments: ["municipal_notice.jpg"]
  }
];

export const dailyReports = [
  {
    id: "REP-301",
    projectId: "PROJ-101",
    date: "2026-02-27",
    submittedBy: "Bob Smith", // Site Engineer
    weather: "Clear, 75°F",
    workCompleted: "Completed formwork for section 2 of the foundation.",
    materialsUsed: "200 sq ft of timber, 50 lbs of nails.",
    equipmentOnSite: ["Excavator (1)", "Concrete Mixer (2)"],
    workerCount: 15,
    notes: "Everything proceeded smoothly. Getting ready for tomorrow's concrete pour."
  },
  {
    id: "REP-302",
    projectId: "PROJ-101",
    date: "2026-02-28",
    submittedBy: "Bob Smith",
    weather: "Light Rain, 65°F",
    workCompleted: "Started preliminary concrete pour for section 1. Rain delayed progress in the afternoon.",
    materialsUsed: "120 cubic yards of concrete.",
    equipmentOnSite: ["Concrete Mixer (2)", "Pump Truck (1)"],
    workerCount: 12,
    notes: "Pump truck had minor issues but was resolved quickly. Check ISS-202."
  }
];

export const safetyObservations = [
  {
    id: "SAF-501",
    projectId: "PROJ-101",
    date: "2026-02-25",
    observer: "Tom Harris", // Safety Officer
    type: "Hazard", // Options: Hazard, Best Practice, Near Miss
    description: "Several workers seen near excavation edge without proper fall protection harnesses.",
    actionTaken: "Brought it to foreman's attention immediately. Harnesses were supplied and worn.",
    status: "Resolved",
    severity: "High"
  },
  {
    id: "SAF-502",
    projectId: "PROJ-102",
    date: "2025-06-05",
    observer: "Tom Harris",
    type: "Best Practice",
    description: "Site clearing team wearing complete PPE correctly despite the high heat condition.",
    actionTaken: "Commended the team during the daily huddle.",
    status: "Closed",
    severity: "Low"
  }
];

export const stopHoldNotices = [
  {
    id: "SHN-901",
    projectId: "PROJ-101",
    dateIssued: "2026-02-20",
    issuedBy: "Tom Harris", // Safety Officer
    reason: "Failed scaffold inspection on the west wing. Scaffold structure is unstable.",
    affectedArea: "West Wing Scaffolding",
    status: "Lifted", // Options: Active, Lifted
    dateLifted: "2026-02-22",
    resolution: "Contractor redesigned the base and reinforced the structure. Passed secondary inspection."
  },
  {
    id: "SHN-902",
    projectId: "PROJ-101",
    dateIssued: "2026-02-28",
    issuedBy: "Municipal Inspector",
    reason: "Unexpected discovery of an underground utility line not marked on surveys.",
    affectedArea: "Excavation Zone C",
    status: "Active", // Blocks project
    dateLifted: null,
    resolution: "Awaiting survey team map update and utility company clearance."
  }
];
