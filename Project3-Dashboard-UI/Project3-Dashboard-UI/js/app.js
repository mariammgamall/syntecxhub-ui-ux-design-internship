/**
 * Aether Dashboard Main Controller Application
 * Manages state, handles user interaction, pagination, sorting, and drives DOM changes.
 */
document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------
    // GLOBAL STATE MANAGEMENT
    // -------------------------------------------------------------
    const state = {
        startDate: "",
        endDate: "",
        activeDatePreset: "30d",
        category: "all",
        status: "all",
        search: "",
        
        // Table parameters
        currentPage: 1,
        pageSize: 8,
        sortField: "date",
        sortOrder: "desc",

        // Chart configuration
        activeChartRange: "day", // 'day' (daily) or 'month' (weekly)

        // Drill down tracking
        activeDrillKey: null, // 'revenue', 'users', 'conversion', 'operations'
        
        // Active view
        activeView: "dashboard",

        // Currency preference
        currency: "USD",
        custCurrentPage: 1
    };

    // -------------------------------------------------------------
    // SELECTORS & CACHED DOM NODES
    // -------------------------------------------------------------
    const sidebar = document.getElementById("sidebar");
    const mobileToggle = document.getElementById("mobile-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const mainNav = document.getElementById("main-nav");
    const backdrop = document.getElementById("backdrop");

    const pageTitle = document.querySelector(".page-title");
    const currentRangeLabel = document.getElementById("current-range-label");
    const globalSearch = document.getElementById("global-search");
    const categoryFilter = document.getElementById("category-filter");
    const statusFilter = document.getElementById("status-filter");

    const dateRangeTrigger = document.getElementById("date-range-trigger");
    const dateRangeMenu = document.getElementById("date-range-menu");
    const activeDatePresetText = document.getElementById("active-date-preset");
    const customInputs = document.getElementById("custom-inputs");
    const startDateInput = document.getElementById("start-date-input");
    const endDateInput = document.getElementById("end-date-input");
    const applyCustomDates = document.getElementById("apply-custom-dates");

    const tableRows = document.getElementById("table-rows");
    const tableSummaryText = document.getElementById("table-summary-text");
    const pagPrev = document.getElementById("pag-prev");
    const pagNext = document.getElementById("pag-next");
    const pagNumber = document.getElementById("pag-number");
    const sortHeaders = document.querySelectorAll(".data-table th.sortable");

    const drillDrawer = document.getElementById("drill-drawer");
    const closeDrawerBtn = document.getElementById("close-drawer");
    const drawerTitle = document.getElementById("drawer-headline");
    const drawerSubtitle = document.getElementById("drawer-subline");
    const drawerMetaGrid = document.getElementById("drawer-meta");
    const drawerLogsList = document.getElementById("drawer-logs");
    const drawerLogsTitle = document.getElementById("drawer-logs-title");

    const kpiCards = document.querySelectorAll(".kpi-card");
    const chartTabBtns = document.querySelectorAll(".chart-tab-btn");
    const exportCsvBtn = document.getElementById("export-csv-btn");

    // SPA View components & placeholders selectors
    const viewPanels = document.querySelectorAll(".view-panel");
    const revenueChartCard = document.getElementById("revenue-chart-card");
    const channelChartCard = document.getElementById("channel-chart-card");
    const transactionsTableCard = document.getElementById("transactions-table-card");

    const dbRevenueChartPlaceholder = document.getElementById("db-revenue-chart-placeholder");
    const dbChannelChartPlaceholder = document.getElementById("db-channel-chart-placeholder");
    const dbTablePlaceholder = document.getElementById("db-table-placeholder");

    const analRevenueChartPlaceholder = document.getElementById("anal-revenue-chart-placeholder");
    const analChannelChartPlaceholder = document.getElementById("anal-channel-chart-placeholder");

    const logsTablePlaceholder = document.getElementById("logs-table-placeholder");

    // -------------------------------------------------------------
    // CURRENCY CONVERSION & PERSISTENCE
    // -------------------------------------------------------------
    const exchangeRates = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78
    };

    const currencySymbols = {
        USD: "$",
        EUR: "€",
        GBP: "£"
    };

    window.formatCurrency = function(val, decimals = 2) {
        const currency = state.currency || "USD";
        const converted = val * exchangeRates[currency];
        const symbol = currencySymbols[currency];
        return `${symbol}${converted.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    };

    // Initialize saved theme on start
    const savedTheme = localStorage.getItem("aether-theme") || "dark-theme";
    document.body.className = savedTheme;

    // -------------------------------------------------------------
    // INITIALIZATION & DATE PRESETS
    // -------------------------------------------------------------
    function setDateRangePreset(preset) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const end = new Date(today);
        const start = new Date(today);

        if (preset === "7d") {
            start.setDate(today.getDate() - 6);
        } else if (preset === "30d") {
            start.setDate(today.getDate() - 29);
        } else if (preset === "90d") {
            start.setDate(today.getDate() - 89);
        }

        state.startDate = start.toISOString().split("T")[0];
        state.endDate = end.toISOString().split("T")[0];
        state.activeDatePreset = preset;

        // Set inputs to match
        startDateInput.value = state.startDate;
        endDateInput.value = state.endDate;

        // Sync header labels
        updateHeaderLabels();
    }

    function updateHeaderLabels() {
        const startFormatted = formatDateString(state.startDate);
        const endFormatted = formatDateString(state.endDate);
        
        currentRangeLabel.textContent = `Report window: ${startFormatted} to ${endFormatted}`;
        
        if (state.activeDatePreset === "custom") {
            activeDatePresetText.textContent = "Custom Window";
        } else {
            const count = state.activeDatePreset === "7d" ? 7 : state.activeDatePreset === "30d" ? 30 : 90;
            activeDatePresetText.textContent = `Last ${count} Days`;
        }
    }

    function formatDateString(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    }

    // Set initial date range to last 30 days on startup
    setDateRangePreset("30d");

    // -------------------------------------------------------------
    // DATA RENDER AND UPDATE LOOP
    // -------------------------------------------------------------
    let cachedQueryResult = null;

    function refreshDashboard() {
        // Query Database
        cachedQueryResult = window.AetherDB.query(
            state.startDate, 
            state.endDate, 
            state.category, 
            state.status, 
            state.search
        );

        // Update KPIs
        updateKPICards(cachedQueryResult.kpis);

        // Update Charts
        window.AetherCharts.update(cachedQueryResult.charts, state.activeChartRange);

        // Update Table
        renderTransactionTable();

        // Update Customers view
        if (state.activeView === "users") {
            renderCustomerLedger();
        }

        // Update Drawer if open
        if (state.activeDrillKey && drillDrawer.classList.contains("active")) {
            populateDrillDownDrawer();
        }
    }

    // Update KPI Card HTML values & styles
    function updateKPICards(kpis) {
        const renderTrend = (element, trendValue, isHealth = false) => {
            element.className = "kpi-trend";
            if (isHealth) {
                element.classList.add("flat");
                element.textContent = "Stable";
                return;
            }

            if (trendValue > 0) {
                element.classList.add("up");
                element.textContent = `+${trendValue}%`;
            } else if (trendValue < 0) {
                element.classList.add("down");
                element.textContent = `${trendValue}%`;
            } else {
                element.classList.add("flat");
                element.textContent = `0.0%`;
            }
        };

        // Revenue KPI
        document.getElementById("kpi-val-revenue").textContent = window.formatCurrency(kpis.revenue.value);
        renderTrend(document.getElementById("kpi-trend-revenue"), kpis.revenue.trend);

        // Users KPI
        document.getElementById("kpi-val-users").textContent = kpis.customers.value.toLocaleString();
        renderTrend(document.getElementById("kpi-trend-users"), kpis.customers.trend);

        // Conversion KPI
        document.getElementById("kpi-val-conversion").textContent = window.formatCurrency(kpis.avgOrderValue.value);
        renderTrend(document.getElementById("kpi-trend-conversion"), kpis.avgOrderValue.trend);

        // Health KPI
        document.getElementById("kpi-val-health").textContent = `${kpis.health.value.toFixed(1)}%`;
        renderTrend(document.getElementById("kpi-trend-health"), kpis.health.trend, true);
    }

    // Render Transaction Log Table rows with sorting & paging
    function renderTransactionTable() {
        if (!cachedQueryResult) return;
        
        let txList = [...cachedQueryResult.transactions];

        // Apply Sorting logic
        txList.sort((a, b) => {
            let fieldA = a[state.sortField];
            let fieldB = b[state.sortField];

            // Tie breaker or custom parse
            if (state.sortField === "amount" || state.sortField === "cost") {
                fieldA = parseFloat(fieldA);
                fieldB = parseFloat(fieldB);
            } else if (state.sortField === "date") {
                fieldA = new Date(fieldA).getTime();
                fieldB = new Date(fieldB).getTime();
            } else {
                fieldA = String(fieldA).toLowerCase();
                fieldB = String(fieldB).toLowerCase();
            }

            if (fieldA < fieldB) return state.sortOrder === "asc" ? -1 : 1;
            if (fieldA > fieldB) return state.sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Compute Pages count
        const totalEntries = txList.length;
        const totalPages = Math.max(1, Math.ceil(totalEntries / state.pageSize));

        // Clamping current page to limits
        if (state.currentPage > totalPages) {
            state.currentPage = totalPages;
        }

        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = Math.min(startIndex + state.pageSize, totalEntries);
        const paginatedTx = txList.slice(startIndex, endIndex);

        // Populate rows
        tableRows.innerHTML = "";
        
        if (paginatedTx.length === 0) {
            tableRows.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 32px; color: var(--text-muted);">
                        No transactions match the filter criteria. Try adjusting date presets or search terms.
                    </td>
                </tr>
            `;
        } else {
            paginatedTx.forEach(tx => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-family: monospace; font-weight: 600;">${tx.id}</td>
                    <td>
                        <div style="font-weight: 500;">${tx.customer}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${tx.email}</div>
                    </td>
                    <td>${formatDateString(tx.date)}</td>
                    <td><span style="font-weight: 500; font-size: 0.85rem;">${tx.category}</span></td>
                    <td class="text-right" style="font-weight: 700; color: var(--text-primary);">${window.formatCurrency(tx.amount)}</td>
                    <td><span class="badge ${tx.status.toLowerCase()}">${tx.status}</span></td>
                    <td class="text-center">
                        <button class="row-drill-btn" data-id="${tx.id}">Inspect</button>
                    </td>
                `;

                // Hook inspection details inside row
                tr.querySelector(".row-drill-btn").addEventListener("click", (e) => {
                    e.stopPropagation();
                    openTransactionDrillDown(tx);
                });

                tableRows.appendChild(tr);
            });
        }

        // Update Pagination Footer controls
        pagNumber.textContent = state.currentPage;
        pagPrev.disabled = state.currentPage === 1;
        pagNext.disabled = state.currentPage === totalPages;

        if (totalEntries === 0) {
            tableSummaryText.textContent = "Showing 0 entries";
        } else {
            tableSummaryText.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;
        }

        // Render sort header visual indicators
        sortHeaders.forEach(th => {
            const field = th.dataset.sort;
            th.classList.remove("asc", "desc");
            if (field === state.sortField) {
                th.classList.add(state.sortOrder);
            }
        });
    }

    // -------------------------------------------------------------
    // DRILL-IN DETAIL DRAWER MANAGEMENT
    // -------------------------------------------------------------
    function openDrawer() {
        drillDrawer.classList.add("active");
        backdrop.classList.add("active");
        document.body.style.overflow = "hidden"; // Disable background scrolling
    }

    function closeDrawer() {
        drillDrawer.classList.remove("active");
        backdrop.classList.remove("active");
        document.body.style.overflow = "";
        state.activeDrillKey = null;
    }

    function selectColorByDrillKey(key) {
        if (key === 'revenue') return '#6366f1';
        if (key === 'users') return '#818cf8';
        if (key === 'conversion') return '#10b981';
        if (key === 'operations') return '#f59e0b';
        return '#6366f1';
    }

    // Populate drawer values for global KPI clicks
    function populateDrillDownDrawer() {
        if (!cachedQueryResult || !state.activeDrillKey) return;

        const data = cachedQueryResult.drillDown(state.activeDrillKey);
        
        let headlineTitle = "Workspace Details";
        let subTitle = "Metrics audit workspace";

        if (state.activeDrillKey === 'revenue') {
            headlineTitle = "Revenue & Sales Ledger";
            subTitle = "Cumulative performance, profit margin ratios, and audit logs.";
            drawerLogsTitle.textContent = "Incoming Completed Payments";
        } else if (state.activeDrillKey === 'users') {
            headlineTitle = "Customer Retainer Analysis";
            subTitle = "Unique transactional user statistics and engagement signals.";
            drawerLogsTitle.textContent = "Recent Client Interactivity Logs";
        } else if (state.activeDrillKey === 'conversion') {
            headlineTitle = "Ticket Values Audit";
            subTitle = "Mean checkout ticket size breakdown and order ratios.";
            drawerLogsTitle.textContent = "Detailed Invoice Cleared Logs";
        } else if (state.activeDrillKey === 'operations') {
            headlineTitle = "Operational Clearance Status";
            subTitle = "Clearance failure tracking, system halts, and exceptions.";
            drawerLogsTitle.textContent = "Operations Exception/Warning Queue";
        }

        drawerTitle.textContent = headlineTitle;
        drawerSubtitle.textContent = subTitle;

        // Render Metadata cards inside Drawer
        drawerMetaGrid.innerHTML = "";
        data.metadata.forEach(item => {
            const div = document.createElement("div");
            div.className = "meta-item";
            let valStr = item.value;
            if (valStr.startsWith("$")) {
                const num = parseFloat(valStr.replace(/[$,]/g, ""));
                if (!isNaN(num)) {
                    valStr = window.formatCurrency(num);
                }
            }
            div.innerHTML = `
                <span class="meta-label">${item.label}</span>
                <h4 class="meta-value">${valStr}</h4>
                <p class="meta-desc">${item.desc}</p>
            `;
            drawerMetaGrid.appendChild(div);
        });

        // Initialize Sparkline Chart inside Drawer
        window.AetherCharts.initMini(data.chartSeries, selectColorByDrillKey(state.activeDrillKey));

        // Render logs list inside Drawer
        drawerLogsList.innerHTML = "";
        if (data.logs.length === 0) {
            drawerLogsList.innerHTML = `
                <div class="text-center" style="padding: 16px; color: var(--text-muted); font-size: 0.8rem;">
                    No recent events logged for this parameter.
                </div>
            `;
        } else {
            data.logs.forEach(log => {
                const item = document.createElement("div");
                item.className = "log-item";
                let logMeta = log.meta;
                logMeta = logMeta.replace(/\$([0-9.,]+)/g, (match, p1) => {
                    const num = parseFloat(p1.replace(/,/g, ""));
                    return isNaN(num) ? match : window.formatCurrency(num);
                });
                item.innerHTML = `
                    <span class="log-time">${log.time}</span>
                    <div class="log-details">
                        <div class="log-desc">${log.title}</div>
                        <div class="log-meta">${log.desc}</div>
                        <div style="font-size: 0.7rem; color: var(--primary); font-weight: 600; margin-top: 2px;">${logMeta}</div>
                    </div>
                `;
                drawerLogsList.appendChild(item);
            });
        }
    }

    // Inspect unique transaction row click
    function openTransactionDrillDown(tx) {
        state.activeDrillKey = 'transaction'; // Custom key overrides KPI keys
        
        drawerTitle.textContent = `Audit Log: ${tx.id}`;
        drawerSubtitle.textContent = `Detailed snapshot parameters for checkout transaction ID ${tx.id}`;
        drawerLogsTitle.textContent = "Transaction Audit History";

        // Display transaction properties in metadata
        drawerMetaGrid.innerHTML = `
            <div class="meta-item">
                <span class="meta-label">Customer Name</span>
                <h4 class="meta-value" style="font-size: 1.1rem; line-height: 1.25; margin-top: 8px;">${tx.customer}</h4>
                <p class="meta-desc">${tx.email}</p>
            </div>
            <div class="meta-item">
                <span class="meta-label">Transaction Date</span>
                <h4 class="meta-value" style="font-size: 1.1rem; line-height: 1.25; margin-top: 8px;">${formatDateString(tx.date)}</h4>
                <p class="meta-desc">Cleared YYYY-MM-DD: ${tx.date}</p>
            </div>
            <div class="meta-item">
                <span class="meta-label">Gross Clearance</span>
                <h4 class="meta-value" style="color: var(--success);">${window.formatCurrency(tx.amount)}</h4>
                <p class="meta-desc">Category: ${tx.category}</p>
            </div>
            <div class="meta-item">
                <span class="meta-label">Direct Expense / Cost</span>
                <h4 class="meta-value" style="color: var(--danger);">${window.formatCurrency(tx.cost)}</h4>
                <p class="meta-desc">Profit margin: +${window.formatCurrency(tx.amount - tx.cost)}</p>
            </div>
            <div class="meta-item col-span-2">
                <span class="meta-label">Status Flag &amp; Channel Route</span>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
                    <span class="badge ${tx.status.toLowerCase()}">${tx.status}</span>
                    <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">Acquired Route: <b>${tx.channel}</b></span>
                </div>
            </div>
        `;

        // Render miniature mock timeline inside transaction drawer representing standard user checkout timeline
        const miniSeries = [
            {
                name: 'User Click Journey (s)',
                data: [
                    { x: 'Landing', y: 3.4 },
                    { x: 'Listing', y: 12.8 },
                    { x: 'Cart Add', y: 5.1 },
                    { x: 'Form Entry', y: 45.2 },
                    { x: 'Checkout Auth', y: 8.6 }
                ]
            }
        ];
        
        window.AetherCharts.initMini(miniSeries, '#3b82f6');

        // Output audit logs
        drawerLogsList.innerHTML = `
            <div class="log-item">
                <span class="log-time">10:04:12</span>
                <div class="log-details">
                    <div class="log-desc">Fulfillment Dispatch Dispatched</div>
                    <div class="log-meta">Cleared invoice routing token sent to mail systems.</div>
                </div>
            </div>
            <div class="log-item">
                <span class="log-time">10:04:09</span>
                <div class="log-details">
                    <div class="log-desc">Payment Verification Cleared</div>
                    <div class="log-meta">Stripe gateway verified token authorization token. Status code: 200 SUCCESS</div>
                </div>
            </div>
            <div class="log-item">
                <span class="log-time">10:03:52</span>
                <div class="log-details">
                    <div class="log-desc">Cart Finalized &amp; Submitted</div>
                    <div class="log-meta">User authorized checkout process on node server location US-East.</div>
                </div>
            </div>
        `;

        openDrawer();
    }

    // -------------------------------------------------------------
    // SPA ROUTING & PLACEMENTS
    // -------------------------------------------------------------
    function updateViewLayout() {
        const view = state.activeView;

        // Hide all view panels first
        viewPanels.forEach(panel => panel.classList.add("hidden"));

        // Show filters container except for settings view
        const headerActions = document.querySelector(".header-actions");
        if (view === "settings") {
            headerActions.classList.add("hidden");
        } else {
            headerActions.classList.remove("hidden");
        }

        // Move component cards based on target view routing
        if (view === "dashboard") {
            dbRevenueChartPlaceholder.appendChild(revenueChartCard);
            dbChannelChartPlaceholder.appendChild(channelChartCard);
            dbTablePlaceholder.appendChild(transactionsTableCard);
            document.getElementById("view-dashboard").classList.remove("hidden");
        } else if (view === "analytics") {
            analRevenueChartPlaceholder.appendChild(revenueChartCard);
            analChannelChartPlaceholder.appendChild(channelChartCard);
            document.getElementById("view-analytics").classList.remove("hidden");
        } else if (view === "users") {
            renderCustomerLedger();
            document.getElementById("view-users").classList.remove("hidden");
        } else if (view === "transactions") {
            logsTablePlaceholder.appendChild(transactionsTableCard);
            document.getElementById("view-transactions").classList.remove("hidden");
        } else if (view === "settings") {
            document.getElementById("view-settings").classList.remove("hidden");
        }

        // Trigger resize event to make ApexCharts adapt to new dimensions
        window.dispatchEvent(new Event("resize"));
    }

    // -------------------------------------------------------------
    // CUSTOMER LEDGER GENERATOR
    // -------------------------------------------------------------
    function renderCustomerLedger() {
        const customerTableRows = document.getElementById("customer-table-rows");
        if (!customerTableRows) return;

        // Group transactions by customer
        const customerMap = {};
        const allTx = window.AetherDB.allTransactions;

        allTx.forEach(tx => {
            // Apply search filter if matching
            const matchesSearch = !state.search || 
                tx.customer.toLowerCase().includes(state.search.toLowerCase()) ||
                tx.email.toLowerCase().includes(state.search.toLowerCase());
            
            if (!matchesSearch) return;

            const name = tx.customer;
            if (!customerMap[name]) {
                customerMap[name] = {
                    customer: name,
                    email: tx.email,
                    orders: 0,
                    spent: 0,
                    categories: {},
                    lastDate: tx.date
                };
            }

            if (tx.status === "Completed") {
                customerMap[name].orders++;
                customerMap[name].spent += tx.amount;
                customerMap[name].categories[tx.category] = (customerMap[name].categories[tx.category] || 0) + 1;
                
                // Track latest date
                if (new Date(tx.date) > new Date(customerMap[name].lastDate)) {
                    customerMap[name].lastDate = tx.date;
                }
            }
        });

        const customers = Object.values(customerMap).sort((a, b) => b.spent - a.spent);

        const custPageSize = 8;
        const totalEntries = customers.length;
        const totalPages = Math.max(1, Math.ceil(totalEntries / custPageSize));
        
        let custCurrentPage = state.custCurrentPage || 1;
        if (custCurrentPage > totalPages) custCurrentPage = totalPages;
        state.custCurrentPage = custCurrentPage;

        const startIndex = (custCurrentPage - 1) * custPageSize;
        const endIndex = Math.min(startIndex + custPageSize, totalEntries);
        const paginated = customers.slice(startIndex, endIndex);

        customerTableRows.innerHTML = "";

        if (paginated.length === 0) {
            customerTableRows.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 32px; color: var(--text-muted);">
                        No customers match the filter criteria.
                    </td>
                </tr>
            `;
        } else {
            paginated.forEach(c => {
                let prefCat = "None";
                let maxCount = 0;
                Object.entries(c.categories).forEach(([cat, count]) => {
                    if (count > maxCount) {
                        maxCount = count;
                        prefCat = cat;
                    }
                });

                const avgOrder = c.orders > 0 ? (c.spent / c.orders) : 0;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--text-primary);">${c.customer}</td>
                    <td style="color: var(--text-muted); font-size: 0.85rem;">${c.email}</td>
                    <td class="text-center" style="font-weight: 500;">${c.orders}</td>
                    <td class="text-right" style="font-weight: 700; color: var(--success);">${window.formatCurrency(c.spent)}</td>
                    <td class="text-right" style="font-weight: 600;">${window.formatCurrency(avgOrder)}</td>
                    <td><span style="font-weight: 500; font-size: 0.85rem;">${prefCat}</span></td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${formatDateString(c.lastDate)}</td>
                `;
                customerTableRows.appendChild(tr);
            });
        }

        const custPrev = document.getElementById("cust-pag-prev");
        const custNext = document.getElementById("cust-pag-next");
        const custNum = document.getElementById("cust-pag-number");
        const custSummary = document.getElementById("cust-table-summary-text");

        custNum.textContent = custCurrentPage;
        custPrev.disabled = custCurrentPage === 1;
        custNext.disabled = custCurrentPage === totalPages;

        if (totalEntries === 0) {
            custSummary.textContent = "Showing 0 entries";
        } else {
            custSummary.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`;
        }

        if (!custPrev.dataset.bound) {
            custPrev.dataset.bound = "true";
            custPrev.addEventListener("click", () => {
                if (state.custCurrentPage > 1) {
                    state.custCurrentPage--;
                    renderCustomerLedger();
                }
            });
        }
        if (!custNext.dataset.bound) {
            custNext.dataset.bound = "true";
            custNext.addEventListener("click", () => {
                const totalEntries = Object.keys(customerMap).length;
                const totalPages = Math.ceil(totalEntries / custPageSize);
                if (state.custCurrentPage < totalPages) {
                    state.custCurrentPage++;
                    renderCustomerLedger();
                }
            });
        }
    }

    // -------------------------------------------------------------
    // LIVE TRANSACTION STREAM SIMULATION
    // -------------------------------------------------------------
    let simulationInterval = null;
    
    function startSimulation() {
        if (simulationInterval) clearInterval(simulationInterval);
        
        simulationInterval = setInterval(() => {
            const categories = ["Software", "Hardware", "Consulting"];
            const channels = ["Direct", "Social Media", "Organic Search", "Referral"];
            const statuses = ["Completed", "Completed", "Completed", "Completed", "Pending", "Cancelled"];
            
            const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"];
            const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
            
            const random = Math.random;
            const firstName = firstNames[Math.floor(random() * firstNames.length)];
            const lastName = lastNames[Math.floor(random() * lastNames.length)];
            const customer = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
            
            const category = categories[Math.floor(random() * categories.length)];
            const channel = channels[Math.floor(random() * channels.length)];
            const status = statuses[Math.floor(random() * statuses.length)];
            
            let amount = 0;
            if (category === "Software") amount = Math.round((random() * 180 + 20) * 100) / 100;
            else if (category === "Hardware") amount = Math.round((random() * 850 + 150) * 100) / 100;
            else amount = Math.round((random() * 2500 + 500) * 100) / 100;
            
            const cost = Math.round((amount * (random() * 0.25 + 0.15)) * 100) / 100;
            
            const nextTxId = window.AetherDB.allTransactions.length + 1025;
            
            const today = new Date();
            const tx = {
                id: `TX-${nextTxId}`,
                customer: customer,
                email: email,
                date: today.toISOString().split("T")[0],
                timestamp: today.getTime(),
                category: category,
                channel: channel,
                amount: amount,
                cost: cost,
                status: status
            };
            
            window.AetherDB.allTransactions.unshift(tx);
            refreshDashboard();
            console.log(`Simulation: Injected new transaction ${tx.id}`);
        }, 7000);
    }
    
    function stopSimulation() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
    }

    // -------------------------------------------------------------
    // INPUTS & GENERAL EVENTS
    // -------------------------------------------------------------

    // Global Search with small Debounce
    let searchDebounceTimer;
    globalSearch.addEventListener("input", (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            state.search = e.target.value;
            state.currentPage = 1; // reset page
            refreshDashboard();
        }, 300);
    });

    // Category Selector
    categoryFilter.addEventListener("change", (e) => {
        state.category = e.target.value;
        state.currentPage = 1;
        refreshDashboard();
    });

    // Status Selector
    statusFilter.addEventListener("change", (e) => {
        state.status = e.target.value;
        state.currentPage = 1;
        refreshDashboard();
    });

    // Theme Toggle Trigger
    themeToggle.addEventListener("click", () => {
        const body = document.body;
        let newTheme = "dark-theme";
        if (body.classList.contains("dark-theme")) {
            body.classList.replace("dark-theme", "light-theme");
            newTheme = "light-theme";
        } else {
            body.classList.replace("light-theme", "dark-theme");
            newTheme = "dark-theme";
        }
        localStorage.setItem("aether-theme", newTheme);
        
        // Re-apply styles/colors matching theme to charts
        if (cachedQueryResult) {
            window.AetherCharts.applyTheme(cachedQueryResult.charts, state.activeChartRange);
            
            // Re-render drawer mini chart if drawer is currently open
            if (state.activeDrillKey) {
                const data = cachedQueryResult.drillDown(state.activeDrillKey);
                window.AetherCharts.initMini(data.chartSeries, selectColorByDrillKey(state.activeDrillKey));
            }
        }
    });

    // Mobile Sidebar Drawer Toggle
    mobileToggle.addEventListener("click", () => {
        sidebar.classList.add("active");
        backdrop.classList.add("active");
    });

    // Close sidebar/drawer via backdrop overlay click
    backdrop.addEventListener("click", () => {
        sidebar.classList.remove("active");
        closeDrawer();
    });

    closeDrawerBtn.addEventListener("click", closeDrawer);

    // KPI Cards Drill-in binding
    kpiCards.forEach(card => {
        card.addEventListener("click", () => {
            const key = card.dataset.drill;
            state.activeDrillKey = key;
            populateDrillDownDrawer();
            openDrawer();
        });
        
        // Accessibility click bindings (Enter key support)
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Main area chart view selectors (Daily vs Weekly)
    chartTabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            chartTabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeChartRange = btn.dataset.range;
            
            // Render series updates
            if (cachedQueryResult) {
                window.AetherCharts.update(cachedQueryResult.charts, state.activeChartRange);
            }
        });
    });

    // Header Date Presets
    dateRangeTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        dateRangeMenu.classList.toggle("active");
    });

    // Close date range menu on click away
    document.addEventListener("click", (e) => {
        if (!dateRangeTrigger.contains(e.target) && !dateRangeMenu.contains(e.target)) {
            dateRangeMenu.classList.remove("active");
        }
    });

    const presetButtons = dateRangeMenu.querySelectorAll(".preset-btn");
    presetButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            presetButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const preset = btn.dataset.preset;
            if (preset === "custom") {
                customInputs.classList.remove("hidden");
            } else {
                customInputs.classList.add("hidden");
                setDateRangePreset(preset);
                dateRangeMenu.classList.remove("active");
                state.currentPage = 1;
                refreshDashboard();
            }
        });
    });

    applyCustomDates.addEventListener("click", () => {
        const startVal = startDateInput.value;
        const endVal = endDateInput.value;

        if (startVal && endVal) {
            if (new Date(startVal) > new Date(endVal)) {
                alert("Start date cannot be greater than end date.");
                return;
            }
            state.startDate = startVal;
            state.endDate = endVal;
            state.activeDatePreset = "custom";
            
            updateHeaderLabels();
            dateRangeMenu.classList.remove("active");
            state.currentPage = 1;
            refreshDashboard();
        }
    });

    // Navigation Item view toggling
    const navItems = mainNav.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const view = item.dataset.view;
            state.activeView = view;
            
            // Adjust header display name to match view state
            if (view === "dashboard") {
                pageTitle.textContent = "Executive Summary";
            } else if (view === "analytics") {
                pageTitle.textContent = "Analytics Workspace";
            } else if (view === "users") {
                pageTitle.textContent = "Customer Ledger";
            } else if (view === "transactions") {
                pageTitle.textContent = "Sales Logs Archive";
            } else if (view === "settings") {
                pageTitle.textContent = "System Preferences";
            }

            updateViewLayout();
        });
    });

    // Sort Headers binding
    sortHeaders.forEach(th => {
        th.addEventListener("click", () => {
            const field = th.dataset.sort;
            if (state.sortField === field) {
                state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
            } else {
                state.sortField = field;
                state.sortOrder = "asc";
            }
            state.currentPage = 1;
            renderTransactionTable();
        });
    });

    // Pagination Buttons
    pagPrev.addEventListener("click", () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderTransactionTable();
        }
    });

    pagNext.addEventListener("click", () => {
        if (cachedQueryResult) {
            const totalEntries = cachedQueryResult.transactions.length;
            const totalPages = Math.ceil(totalEntries / state.pageSize);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTransactionTable();
            }
        }
    });

    // Export CSV Helper
    exportCsvBtn.addEventListener("click", () => {
        if (!cachedQueryResult || cachedQueryResult.transactions.length === 0) {
            alert("No data available to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Order ID,Customer,Email,Date,Category,Channel,Amount,Cost,Status\n";

        cachedQueryResult.transactions.forEach(tx => {
            const row = `"${tx.id}","${tx.customer}","${tx.email}","${tx.date}","${tx.category}","${tx.channel}",${tx.amount},${tx.cost},"${tx.status}"`;
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aether_sales_export_${state.startDate}_to_${state.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // -------------------------------------------------------------
    // SETTINGS CONTROL LISTENERS
    // -------------------------------------------------------------
    const settingCurrency = document.getElementById("setting-currency");
    const settingPageSize = document.getElementById("setting-pagesize");
    const settingSimulation = document.getElementById("setting-simulation");
    const settingReseedBtn = document.getElementById("setting-reseed-btn");

    if (settingCurrency) {
        settingCurrency.addEventListener("change", (e) => {
            state.currency = e.target.value;
            refreshDashboard();
        });
    }

    if (settingPageSize) {
        settingPageSize.addEventListener("change", (e) => {
            state.pageSize = parseInt(e.target.value);
            state.currentPage = 1;
            refreshDashboard();
        });
    }

    if (settingSimulation) {
        settingSimulation.addEventListener("change", (e) => {
            if (e.target.checked) {
                startSimulation();
            } else {
                stopSimulation();
            }
        });
    }

    if (settingReseedBtn) {
        settingReseedBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to regenerate all mock transaction logs?")) {
                window.AetherDB.reseed();
                state.currentPage = 1;
                state.custCurrentPage = 1;
                refreshDashboard();
            }
        });
    }

    // -------------------------------------------------------------
    // INITIAL REFRESH CALL
    // -------------------------------------------------------------
    updateViewLayout();
    refreshDashboard();
});
