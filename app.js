const express = require("express");
const path = require("path");
const { getIssues } = require("./services/jiraService");
const { categorizeIssues } = require("./utils/categorize");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    try {
        const issues = await getIssues();

        // Get filter values from query params
        const filters = {
            removeLow: req.query.removeLow === 'on',
            removeLowest: req.query.removeLowest === 'on',
            removeMedium: req.query.removeMedium === 'on',
            removeOnHold: req.query.removeOnHold === 'on',
            removeNotStarted: req.query.removeNotStarted === 'on'
        };

        // Build the exclusion list dynamically
        const excludePriorities = [];
        const excludeStatuses = [];

        if (filters.removeLow) excludePriorities.push("Low");
        if (filters.removeLowest) excludePriorities.push("Lowest");
        if (filters.removeMedium) excludePriorities.push("Medium");

        if (filters.removeOnHold) excludeStatuses.push("On Hold");
        if (filters.removeNotStarted) excludeStatuses.push("Not Started");

        const { categories, criticalIssues } = categorizeIssues(issues, {
            excludePriorities,
            excludeStatuses
        });

        // Pass filters to the view
        res.render("index", { categories, criticalIssues, filters });

    } catch (error) {
        res.status(500).send("Error fetching Jira issues: " + error.message);
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dashboard running on http://localhost:${PORT}`));
