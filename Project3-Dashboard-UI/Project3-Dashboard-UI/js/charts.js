/**
 * Aether Dashboard Charts Manager
 * Coordinates chart instantiation, theme updates, and series updates.
 */
(function() {
    let mainAreaChart = null;
    let channelDoughnutChart = null;
    let drawerMiniChart = null;

    function formatCurrencyValue(val, decimals = 0) {
        if (window.formatCurrency) {
            return window.formatCurrency(val, decimals);
        }
        return '$' + Math.round(val).toLocaleString();
    }

    // Helper: Determine if dark theme is currently active
    function isDarkTheme() {
        return document.body.classList.contains('dark-theme');
    }

    // Colors matching style.css theme properties
    const themeColors = {
        violet: '#6366f1',
        violetGlow: 'rgba(99, 102, 241, 0.12)',
        rose: '#f43f5e',
        roseGlow: 'rgba(244, 63, 94, 0.12)',
        emerald: '#10b981',
        emeraldGlow: 'rgba(16, 185, 129, 0.12)',
        amber: '#f59e0b',
        amberGlow: 'rgba(245, 158, 11, 0.12)',
        
        darkText: '#f3f4f6',
        darkMuted: '#9ca3af',
        darkGrid: 'rgba(255, 255, 255, 0.06)',
        darkTooltipBg: '#111622',
        darkBorder: 'rgba(255, 255, 255, 0.08)',

        lightText: '#0f172a',
        lightMuted: '#475569',
        lightGrid: 'rgba(0, 0, 0, 0.05)',
        lightTooltipBg: '#ffffff',
        lightBorder: 'rgba(0, 0, 0, 0.06)'
    };

    /**
     * Compute visual properties based on theme
     */
    function getThemeTokens() {
        const dark = isDarkTheme();
        return {
            text: dark ? themeColors.darkMuted : themeColors.lightMuted,
            titleText: dark ? themeColors.darkText : themeColors.lightText,
            grid: dark ? themeColors.darkGrid : themeColors.lightGrid,
            tooltipBg: dark ? themeColors.darkTooltipBg : themeColors.lightTooltipBg,
            border: dark ? themeColors.darkBorder : themeColors.lightBorder,
            mode: dark ? 'dark' : 'light'
        };
    }

    /**
     * Set up Main Area Chart
     */
    function initMainAreaChart(dailyData) {
        const tokens = getThemeTokens();
        
        const options = {
            series: [
                { name: 'Revenue', data: dailyData.map(d => d.revenue) },
                { name: 'Direct Cost', data: dailyData.map(d => d.cost) }
            ],
            chart: {
                id: 'main-area',
                type: 'area',
                height: 320,
                parentHeightOffset: 0,
                toolbar: { show: false },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 400,
                    animateGradually: { enabled: true, delay: 15 },
                    dynamicAnimation: { enabled: true, speed: 250 }
                },
                background: 'transparent',
                foreColor: tokens.text
            },
            colors: [themeColors.violet, themeColors.rose],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.35,
                    opacityTo: 0.02,
                    stops: [0, 95, 100]
                }
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2.5
            },
            grid: {
                borderColor: tokens.grid,
                strokeDashArray: 4,
                padding: { left: 16, right: 16, bottom: 0, top: 0 }
            },
            xaxis: {
                categories: dailyData.map(d => d.date),
                labels: {
                    show: true,
                    style: { colors: tokens.text, fontSize: '11px' }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                labels: {
                    show: true,
                    style: { colors: tokens.text, fontSize: '11px' },
                    formatter: function(val) {
                        return formatCurrencyValue(val, 0);
                    }
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: tokens.titleText },
                itemMargin: { horizontal: 12 }
            },
            tooltip: {
                theme: tokens.mode,
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const rev = series[0][dataPointIndex];
                    const cost = series[1][dataPointIndex];
                    const profit = rev - cost;
                    const date = w.globals.categoryHeaders[dataPointIndex];
                    
                    return `
                        <div class="custom-chart-tooltip" style="padding: 12px; background: ${tokens.tooltipBg}; border: 1px solid ${tokens.border}; border-radius: 8px;">
                            <div style="font-size: 11px; color: ${tokens.text}; font-weight: 600; margin-bottom: 6px;">${date}</div>
                            <div style="display: flex; gap: 16px; font-size: 12px;">
                                <div><span style="color: ${themeColors.violet};">●</span> Rev: <b>${formatCurrencyValue(rev, 2)}</b></div>
                                <div><span style="color: ${themeColors.rose};">●</span> Cost: <b>${formatCurrencyValue(cost, 2)}</b></div>
                            </div>
                            <div style="font-size: 12px; margin-top: 4px; border-top: 1px solid ${tokens.grid}; padding-top: 4px;">
                                <span style="color: ${themeColors.emerald};">●</span> Profit: <b>${formatCurrencyValue(profit, 2)}</b>
                            </div>
                        </div>
                    `;
                }
            }
        };

        mainAreaChart = new ApexCharts(document.querySelector("#revenue-area-chart"), options);
        mainAreaChart.render();
    }

    /**
     * Set up Distribution Doughnut Chart
     */
    function initDistributionChart(distData) {
        const tokens = getThemeTokens();
        
        const options = {
            series: distData.map(d => d.value),
            chart: {
                id: 'channel-doughnut',
                type: 'donut',
                height: 320,
                background: 'transparent',
                foreColor: tokens.text
            },
            labels: distData.map(d => d.channel),
            colors: [themeColors.violet, '#3b82f6', themeColors.emerald, themeColors.amber],
            stroke: {
                show: true,
                width: 2,
                colors: [tokens.tooltipBg]
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '72%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontFamily: 'Outfit, Inter',
                                color: tokens.text
                            },
                            value: {
                                show: true,
                                fontSize: '20px',
                                fontFamily: 'Outfit, Inter',
                                fontWeight: '700',
                                color: tokens.titleText,
                                formatter: function (val) {
                                    return formatCurrencyValue(parseFloat(val), 0);
                                }
                            },
                            total: {
                                show: true,
                                label: 'Total Share',
                                color: tokens.text,
                                formatter: function (w) {
                                    const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                    return formatCurrencyValue(sum, 0);
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                labels: { colors: tokens.titleText }
            },
            dataLabels: { enabled: false },
            tooltip: {
                theme: tokens.mode,
                y: {
                    formatter: function(val) {
                        return formatCurrencyValue(val, 2);
                    }
                }
            }
        };

        channelDoughnutChart = new ApexCharts(document.querySelector("#channel-doughnut-chart"), options);
        channelDoughnutChart.render();
    }

    /**
     * Set up Mini Timeline Chart in Drawer
     */
    function initDrawerMiniChart(seriesData, colorHex) {
        const tokens = getThemeTokens();
        
        const options = {
            series: seriesData,
            chart: {
                id: 'drawer-mini',
                type: 'area',
                height: 160,
                parentHeightOffset: 0,
                toolbar: { show: false },
                animations: { enabled: true, speed: 300 },
                background: 'transparent',
                foreColor: tokens.text,
                sparkline: { enabled: true }
            },
            colors: [colorHex || themeColors.violet, themeColors.emerald],
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.25,
                    opacityTo: 0.01,
                    stops: [0, 95, 100]
                }
            },
            xaxis: {
                type: 'category',
                labels: { show: false }
            },
            yaxis: {
                labels: { show: false }
            },
            tooltip: {
                theme: tokens.mode,
                x: { show: true },
                y: {
                    formatter: function(val) {
                        if (val >= 1000 || val < 1) {
                            return formatCurrencyValue(val, 2);
                        }
                        return val.toString();
                    }
                }
            }
        };

        if (drawerMiniChart) {
            drawerMiniChart.destroy();
        }

        drawerMiniChart = new ApexCharts(document.querySelector("#drawer-mini-chart"), options);
        drawerMiniChart.render();
    }

    /**
     * Main charts update sequence (invoked on filter action)
     */
    function updateDashboardCharts(chartsData, activeTabRange) {
        const tokens = getThemeTokens();
        const mainSource = activeTabRange === 'month' ? chartsData.weekly : chartsData.daily;

        if (!mainAreaChart) {
            initMainAreaChart(mainSource);
        } else {
            mainAreaChart.updateOptions({
                foreColor: tokens.text,
                grid: { borderColor: tokens.grid },
                xaxis: {
                    categories: mainSource.map(d => d.date),
                    labels: { style: { colors: tokens.text } }
                },
                yaxis: {
                    labels: { style: { colors: tokens.text } }
                },
                legend: {
                    labels: { colors: tokens.titleText }
                },
                tooltip: { theme: tokens.mode }
            });
            mainAreaChart.updateSeries([
                { name: 'Revenue', data: mainSource.map(d => d.revenue) },
                { name: 'Direct Cost', data: mainSource.map(d => d.cost) }
            ]);
        }

        if (!channelDoughnutChart) {
            initDistributionChart(chartsData.distribution);
        } else {
            channelDoughnutChart.updateOptions({
                foreColor: tokens.text,
                labels: chartsData.distribution.map(d => d.channel),
                legend: {
                    labels: { colors: tokens.titleText }
                },
                stroke: {
                    colors: [tokens.tooltipBg]
                },
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                name: { color: tokens.text },
                                value: { color: tokens.titleText }
                            }
                        }
                    }
                },
                tooltip: { theme: tokens.mode }
            });
            channelDoughnutChart.updateSeries(chartsData.distribution.map(d => d.value));
        }
    }

    /**
     * Repaint/update colors when layout theme changes (dark/light toggled)
     */
    function applyThemeToCharts(chartsData, activeTabRange) {
        // Redraw current series with new styling properties
        updateDashboardCharts(chartsData, activeTabRange);
    }

    // Expose charts interface globally
    window.AetherCharts = {
        update: updateDashboardCharts,
        initMini: initDrawerMiniChart,
        applyTheme: applyThemeToCharts
    };
})();
