import SiteProgressReport from "../models/siteProgressReport.js";

// @desc    Create a new site progress report
// @route   POST /api/projects/:projectId/site-progress-reports
// @access  Site Engineer
export const createReport = async (req, res) => {
    try {
        const { reportDate, summary, workCompleted, plannedNextSteps, delaysOrRisks, weatherNotes } = req.body;
        const projectId = req.project._id;

        const report = await SiteProgressReport.create({
            projectId,
            reportedBy: req.user._id,
            reportDate,
            summary,
            workCompleted,
            plannedNextSteps,
            delaysOrRisks,
            weatherNotes
        });

        return res.status(201).json({ success: true, message: "Site progress report created", report });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all site progress reports for a project
// @route   GET /api/projects/:projectId/site-progress-reports
// @access  Project Member
export const getReportsByProject = async (req, res) => {
    try {
        const projectId = req.project._id;

        const reports = await SiteProgressReport.find({ projectId })
            .populate("reportedBy", "name email userRole")
            .sort({ reportDate: -1, createdAt: -1 });

        return res.status(200).json({ success: true, reports });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
