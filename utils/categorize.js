function categorizeIssues(issues, filters = {}) {
    const categories = {
        "Prod Issue": [],
        "Performance optimization": [],
        "New Service/ Feature": [],
        "Security": [],
        "Reporting": [],
        "Upcoming Projects": [],
        "Cost Optimization": [],
        "Other": []
    };

    const criticalIssues = [];

    const deployedStatuses = ['Deployed', 'Done', 'Released', 'Cancelled', 'Closed'];

    for (const issue of issues) {
        const fields = issue.fields;
        const priority = fields.priority?.name || 'Low';
        const dueDate = fields.duedate ? new Date(fields.duedate) : null;
        const status = fields.status?.name || '';

        // ✅ Skip deployed issues
        if (deployedStatuses.includes(status)) {
            continue;
        }

        // ✅ Skip based on filters
        if (filters.excludePriorities?.includes(priority)) {
            continue;
        }

        if (filters.excludeStatuses?.includes(status)) {
            continue;
        }

        // ✅ Use custom field: customfield_10939
        let rawCategory = fields.customfield_10939;
        console.log('Category field raw value:', rawCategory);
        let category = rawCategory?.value || rawCategory || "Other";

        // Normalize category
        const knownCategories = Object.keys(categories);
        if (!knownCategories.includes(category)) {
            category = "Other";
        }

        // Add to category
        categories[category].push({
            key: issue.key,
            summary: fields.summary,
            status,
            priority,
            dueDate
        });

        // Identify critical issues
        const today = new Date();
        const isOverdue = dueDate && dueDate < today;
        const isHighPriority = ["High", "Highest", "Critical"].includes(priority);

        if (isHighPriority && (isOverdue || dueDate)) {
            criticalIssues.push({
                key: issue.key,
                summary: fields.summary,
                priority,
                dueDate,
                status
            });
        }
    }

    return { categories, criticalIssues };
}

module.exports = { categorizeIssues };
