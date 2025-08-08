const axios = require("axios");
const { jiraBaseUrl, projectKey, auth } = require("../config");

const getIssues = async () => {
    const allIssues = [];
    let startAt = 0;
    const maxResults = 100; // safer batch size, respects most Jira limits
    let total = 0;

    do {
        const response = await axios.get(`${jiraBaseUrl}/rest/api/3/search`, {
            params: {
                jql: `project=${projectKey}`,
                startAt,
                maxResults,
                fields: ['summary', 'status', 'priority', 'duedate', 'customfield_10939'] // limit to only needed fields
            },
            auth: {
                username: auth.username,
                password: auth.token
            },
            headers: {
                Accept: "application/json"
            }
        });

        const { issues, total: totalFromJira } = response.data;

        allIssues.push(...issues);
        total = totalFromJira;
        startAt += maxResults;

    } while (startAt < total);

    return allIssues;
};

function applyFilters(issues, filters) {
    return issues.filter(issue => {
        const priority = issue.fields.priority?.name || "";
        const status = issue.fields.status?.name || "";

        if (filters.removeLow && priority === "Low") return false;
        if (filters.removeLowest && priority === "Lowest") return false;
        if (filters.removeMedium && priority === "Medium") return false;
        if (filters.removeOnHold && status === "On Hold") return false;
        if (filters.removeNotStarted && status === "Not Started") return false;

        return true;
    });
}

module.exports = { getIssues, applyFilters };
