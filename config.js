require("dotenv").config();

module.exports = {
    jiraBaseUrl: process.env.JIRA_BASE_URL,
    projectKey: process.env.JIRA_PROJECT_KEY,
    auth: {
        username: process.env.JIRA_EMAIL,
        token: process.env.JIRA_API_TOKEN
    }
};
