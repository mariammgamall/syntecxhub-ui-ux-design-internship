/**
 * Aether Dashboard Mock Database Layer
 * Generates synthetic transaction and metric history spanning 90 days.
 */
(function() {
    // Seeded random number generator for reproducible results
    function seededRandom(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    const categories = ["Software", "Hardware", "Consulting"];
    const channels = ["Direct", "Social Media", "Organic Search", "Referral"];
    const statuses = ["Completed", "Completed", "Completed", "Completed", "Pending", "Cancelled"]; // Weighted Completed

    // Generate 90 days of transactions
    function generateMockTransactions(seedVal = 42) {
        const transactions = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let txIdCounter = 1024;
        let seed = seedVal; // Seeded value for consistent generation

        // Generate ~300 records spread over 90 days (about 3-4 transactions per day)
        for (let d = 89; d >= 0; d--) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() - d);
            
            // Random number of transactions on this day (1 to 6)
            seed = seed + 1;
            const count = Math.floor(seededRandom(seed) * 6) + 1;
            
            for (let i = 0; i < count; i++) {
                txIdCounter++;
                seed = seed + 3;
                
                const customerIndex = Math.floor(seededRandom(seed) * firstNames.length);
                seed = seed + 2;
                const lastNameIndex = Math.floor(seededRandom(seed) * lastNames.length);
                const customer = `${firstNames[customerIndex]} ${lastNames[lastNameIndex]}`;
                const email = `${firstNames[customerIndex].toLowerCase()}.${lastNames[lastNameIndex].toLowerCase()}@example.com`;
                
                seed = seed + 5;
                const catIndex = Math.floor(seededRandom(seed) * categories.length);
                const category = categories[catIndex];
                
                seed = seed + 7;
                const chanIndex = Math.floor(seededRandom(seed) * channels.length);
                const channel = channels[chanIndex];
                
                seed = seed + 11;
                const statusIndex = Math.floor(seededRandom(seed) * statuses.length);
                const status = statuses[statusIndex];

                // Pricing ranges based on category
                let amount = 0;
                seed = seed + 13;
                const randVal = seededRandom(seed);
                if (category === "Software") {
                    amount = Math.round((randVal * 180 + 20) * 100) / 100; // $20 - $200
                } else if (category === "Hardware") {
                    amount = Math.round((randVal * 850 + 150) * 100) / 100; // $150 - $1000
                } else {
                    amount = Math.round((randVal * 2500 + 500) * 100) / 100; // $500 - $3000
                }

                // Calculate Cost of Goods Sold (COGS)
                seed = seed + 17;
                const costPercentage = seededRandom(seed) * 0.25 + 0.15; // 15% to 40%
                const cost = Math.round((amount * costPercentage) * 100) / 100;

                transactions.push({
                    id: `TX-${txIdCounter}`,
                    customer: customer,
                    email: email,
                    date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
                    timestamp: currentDate.getTime(),
                    category: category,
                    channel: channel,
                    amount: amount,
                    cost: cost,
                    status: status
                });
            }
        }

        // Sort descending (latest transactions first)
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    const allTransactions = generateMockTransactions();

    /**
     * Compute comparative delta trend percentage.
     * Compares the target sum to a baseline sum.
     */
    function calculateTrend(currentVal, previousVal) {
        if (previousVal === 0) return currentVal > 0 ? 100 : 0;
        const diff = currentVal - previousVal;
        const percentage = (diff / previousVal) * 100;
        return Math.round(percentage * 10) / 10;
    }

    /**
     * Filter database and compile KPI metrics & chart structures.
     */
    function queryDashboardData(startDateStr, endDateStr, categoryFilter, statusFilter, searchQuery) {
        const start = new Date(startDateStr).getTime();
        // End date should include the full end day (add 23h 59m 59s)
        const end = new Date(endDateStr).getTime() + (24 * 60 * 60 * 1000 - 1);
        const duration = end - start;

        // Baseline previous period dates for trend comparisons
        const prevStart = start - duration;
        const prevEnd = start - 1;

        // Raw Filtered Collections
        const currentPeriodTx = [];
        const previousPeriodTx = [];

        // Apply filters
        allTransactions.forEach(tx => {
            const txTime = tx.timestamp;
            
            // Check general filter criteria (Category, Status, Search Query)
            const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
            
            let matchesSearch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase().trim();
                matchesSearch = tx.id.toLowerCase().includes(query) || 
                                tx.customer.toLowerCase().includes(query) ||
                                tx.email.toLowerCase().includes(query);
            }

            if (matchesCategory && matchesStatus && matchesSearch) {
                if (txTime >= start && txTime <= end) {
                    currentPeriodTx.push(tx);
                } else if (txTime >= prevStart && txTime <= prevEnd) {
                    previousPeriodTx.push(tx);
                }
            }
        });

        // Compute KPIs for CURRENT period
        let curRevenue = 0;
        const curCustomers = new Set();
        let curCompletedCount = 0;
        let curTotalCount = 0;

        currentPeriodTx.forEach(tx => {
            curTotalCount++;
            if (tx.status === 'Completed') {
                curRevenue += tx.amount;
                curCustomers.add(tx.customer);
                curCompletedCount++;
            }
        });

        const curAvgOrderVal = curCompletedCount > 0 ? (curRevenue / curCompletedCount) : 0;
        const curHealthVal = curTotalCount > 0 ? (curCompletedCount / curTotalCount) * 100 : 100;

        // Compute KPIs for PREVIOUS period (to compute trend percentages)
        let prevRevenue = 0;
        const prevCustomers = new Set();
        let prevCompletedCount = 0;
        let prevTotalCount = 0;

        previousPeriodTx.forEach(tx => {
            prevTotalCount++;
            if (tx.status === 'Completed') {
                prevRevenue += tx.amount;
                prevCustomers.add(tx.customer);
                prevCompletedCount++;
            }
        });

        const prevAvgOrderVal = prevCompletedCount > 0 ? (prevRevenue / prevCompletedCount) : 0;
        const prevHealthVal = prevTotalCount > 0 ? (prevCompletedCount / prevTotalCount) * 100 : 100;

        // Trend deltas
        const revenueTrend = calculateTrend(curRevenue, prevRevenue);
        const customersTrend = calculateTrend(curCustomers.size, prevCustomers.size);
        const avgOrderValTrend = calculateTrend(curAvgOrderVal, prevAvgOrderVal);
        const healthTrend = calculateTrend(curHealthVal, prevHealthVal);

        // Timeline aggregations for Main Chart (grouped by date)
        const dateAggMap = {};
        
        // Initialize all dates in range with zeros so chart shows contiguous dates
        const dayInMillis = 24 * 60 * 60 * 1000;
        for (let time = start; time <= end; time += dayInMillis) {
            const dateKey = new Date(time).toISOString().split('T')[0];
            dateAggMap[dateKey] = { revenue: 0, cost: 0, profit: 0, orders: 0 };
        }

        // Accumulate transaction values
        currentPeriodTx.forEach(tx => {
            const dateKey = tx.date;
            if (dateAggMap[dateKey]) {
                dateAggMap[dateKey].orders++;
                if (tx.status === 'Completed') {
                    dateAggMap[dateKey].revenue += tx.amount;
                    dateAggMap[dateKey].cost += tx.cost;
                    dateAggMap[dateKey].profit += (tx.amount - tx.cost);
                }
            }
        });

        // Convert aggregated map to sorted list
        const dailyTrends = Object.keys(dateAggMap).sort().map(dateKey => ({
            date: dateKey,
            revenue: Math.round(dateAggMap[dateKey].revenue * 100) / 100,
            cost: Math.round(dateAggMap[dateKey].cost * 100) / 100,
            profit: Math.round(dateAggMap[dateKey].profit * 100) / 100,
            orders: dateAggMap[dateKey].orders
        }));

        // Group weekly for alternative view
        const weeklyTrends = [];
        let weekRevenue = 0, weekCost = 0, weekProfit = 0, weekOrders = 0;
        let daysInWeekCount = 0;
        let weekStartLabel = "";

        dailyTrends.forEach((day, index) => {
            if (daysInWeekCount === 0) {
                weekStartLabel = day.date;
            }
            weekRevenue += day.revenue;
            weekCost += day.cost;
            weekProfit += day.profit;
            weekOrders += day.orders;
            daysInWeekCount++;

            if (daysInWeekCount === 7 || index === dailyTrends.length - 1) {
                weeklyTrends.push({
                    date: `Wk of ${weekStartLabel.substring(5)}`,
                    revenue: Math.round(weekRevenue * 100) / 100,
                    cost: Math.round(weekCost * 100) / 100,
                    profit: Math.round(weekProfit * 100) / 100,
                    orders: weekOrders
                });
                weekRevenue = 0; weekCost = 0; weekProfit = 0; weekOrders = 0;
                daysInWeekCount = 0;
            }
        });

        // Acquisition Channel distribution share for Doughnut Chart
        const channelShares = {};
        channels.forEach(ch => channelShares[ch] = 0);
        
        currentPeriodTx.forEach(tx => {
            if (tx.status === 'Completed' && channelShares[tx.channel] !== undefined) {
                channelShares[tx.channel] += tx.amount;
            }
        });

        const channelDistribution = Object.keys(channelShares).map(channelName => ({
            channel: channelName,
            value: Math.round(channelShares[channelName] * 100) / 100
        }));

        // Drill-in Drawer data sets
        const getDrillDownBreakdown = (drillKey) => {
            const data = {
                metadata: [],
                logs: [],
                chartSeries: []
            };

            if (drillKey === 'revenue') {
                data.metadata = [
                    { label: "Completed Sales Volume", value: `$${curRevenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, desc: "Direct sales earnings" },
                    { label: "Execution Cost of Goods", value: `$${Math.round(currentPeriodTx.reduce((acc, tx) => acc + (tx.status === 'Completed' ? tx.cost : 0), 0)).toLocaleString()}`, desc: "Delivery/Hardware overheads" },
                    { label: "Gross Margin Ratio", value: `${curRevenue > 0 ? Math.round(((curRevenue - currentPeriodTx.reduce((acc, tx) => acc + (tx.status === 'Completed' ? tx.cost : 0), 0)) / curRevenue) * 100) : 0}%`, desc: "Percent of revenue retained" },
                    { label: "Period Performance Delta", value: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`, desc: "Growth vs previous window" }
                ];

                // Timeline chart series
                data.chartSeries = [
                    { name: 'Revenue', data: dailyTrends.map(d => ({ x: d.date, y: d.revenue })) },
                    { name: 'Gross Profit', data: dailyTrends.map(d => ({ x: d.date, y: d.profit })) }
                ];

                // Related event logs
                data.logs = currentPeriodTx
                    .filter(tx => tx.status === 'Completed')
                    .slice(0, 8)
                    .map(tx => ({
                        time: tx.date,
                        title: "Revenue Received",
                        desc: `Invoice for ${tx.customer} completed in ${tx.category}`,
                        meta: `Amount: +$${tx.amount.toFixed(2)} | Margin: +$${(tx.amount - tx.cost).toFixed(2)}`
                    }));
            } 
            else if (drillKey === 'users') {
                // Customer segment statistics
                const softwareCusts = new Set();
                const hardwareCusts = new Set();
                const consultingCusts = new Set();

                currentPeriodTx.forEach(tx => {
                    if (tx.status === 'Completed') {
                        if (tx.category === 'Software') softwareCusts.add(tx.customer);
                        if (tx.category === 'Hardware') hardwareCusts.add(tx.customer);
                        if (tx.category === 'Consulting') consultingCusts.add(tx.customer);
                    }
                });

                data.metadata = [
                    { label: "Active Buyers", value: curCustomers.size.toString(), desc: "Unique paying customers" },
                    { label: "Software Subscribers", value: softwareCusts.size.toString(), desc: "Acquired software purchasers" },
                    { label: "Enterprise Retainers", value: consultingCusts.size.toString(), desc: "High value service consultations" },
                    { label: "Retention Rate Delta", value: `${customersTrend >= 0 ? '+' : ''}${customersTrend}%`, desc: "Unique user scaling index" }
                ];

                data.chartSeries = [
                    { name: 'Daily Active Buyers', data: dailyTrends.map(d => ({ x: d.date, y: Math.round(d.orders * 0.7) })) }
                ];

                data.logs = currentPeriodTx
                    .slice(0, 8)
                    .map(tx => ({
                        time: tx.date,
                        title: "Customer Engagement",
                        desc: `${tx.customer} (${tx.email}) logged checkout request`,
                        meta: `Channel: ${tx.channel} | Status: ${tx.status}`
                    }));
            } 
            else if (drillKey === 'conversion') {
                data.metadata = [
                    { label: "Avg Ticket Price", value: `$${curAvgOrderVal.toFixed(2)}`, desc: "Mean income per invoice" },
                    { label: "Total Checkouts", value: curCompletedCount.toString(), desc: "Completed orders counter" },
                    { label: "Total Direct Leads", value: curTotalCount.toString(), desc: "Unfiltered order attempts" },
                    { label: "AOV Change Percent", value: `${avgOrderValTrend >= 0 ? '+' : ''}${avgOrderValTrend}%`, desc: "Ticket expansion rate" }
                ];

                data.chartSeries = [
                    { name: 'Average Ticket Value ($)', data: dailyTrends.map(d => ({ x: d.date, y: d.orders > 0 ? Math.round((d.revenue / d.orders) * 100) / 100 : 0 })) }
                ];

                data.logs = currentPeriodTx
                    .filter(tx => tx.status === 'Completed')
                    .slice(0, 8)
                    .map(tx => ({
                        time: tx.date,
                        title: "Cart Value Checkout",
                        desc: `Invoice ${tx.id} cleared for $${tx.amount.toFixed(2)}`,
                        meta: `Purchased item vertical: ${tx.category}`
                    }));
            } 
            else if (drillKey === 'operations') {
                const pendingCount = currentPeriodTx.filter(tx => tx.status === 'Pending').length;
                const cancelledCount = currentPeriodTx.filter(tx => tx.status === 'Cancelled').length;
                
                data.metadata = [
                    { label: "Fulfillment Rate", value: `${curHealthVal.toFixed(1)}%`, desc: "Invoice clearance ratio" },
                    { label: "Pending Deliveries", value: pendingCount.toString(), desc: "Orders awaiting dispatch" },
                    { label: "Cancelled Checkout Exceptions", value: cancelledCount.toString(), desc: "Declined transactions total" },
                    { label: "Fulfillment Variance", value: `${healthTrend >= 0 ? '+' : ''}${healthTrend}%`, desc: "Disrupted logs change margin" }
                ];

                data.chartSeries = [
                    { name: 'Failed Operations', data: dailyTrends.map(d => ({ x: d.date, y: d.orders - Math.round(d.orders * 0.8) })) }
                ];

                data.logs = currentPeriodTx
                    .filter(tx => tx.status === 'Pending' || tx.status === 'Cancelled')
                    .slice(0, 8)
                    .map(tx => ({
                        time: tx.date,
                        title: tx.status === 'Pending' ? "Shipment Processing Awaiting" : "Transaction Cancelled Alert",
                        desc: `Order ${tx.id} for ${tx.customer} flagged as ${tx.status}`,
                        meta: `Value: $${tx.amount.toFixed(2)} | System Exception Handler Node-4`
                    }));
            }

            return data;
        };

        return {
            transactions: currentPeriodTx,
            kpis: {
                revenue: { value: curRevenue, trend: revenueTrend },
                customers: { value: curCustomers.size, trend: customersTrend },
                avgOrderValue: { value: curAvgOrderVal, trend: avgOrderValTrend },
                health: { value: curHealthVal, trend: healthTrend }
            },
            charts: {
                daily: dailyTrends,
                weekly: weeklyTrends,
                distribution: channelDistribution
            },
            drillDown: getDrillDownBreakdown
        };
    }

    function reseed(newSeed) {
        const fresh = generateMockTransactions(newSeed || Math.floor(Math.random() * 1000));
        allTransactions.length = 0;
        fresh.forEach(tx => allTransactions.push(tx));
    }

    // Expose DB interface globally
    window.AetherDB = {
        allTransactions: allTransactions,
        query: queryDashboardData,
        reseed: reseed
    };
})();
