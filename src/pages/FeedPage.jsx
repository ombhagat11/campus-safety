import { useState, useEffect, useRef, useCallback } from "react";
import { getAllReports } from "../services/reportsService";
import socketService from "../services/socketService";
import ReportCard from "../components/ReportCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { REPORT_CATEGORIES, CATEGORY_LABELS } from "../utils/constants";

const FeedPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        category: "",
        severity: "",
        sort: "newest",
        status: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const observer = useRef();

    const lastReportElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchReports = async (pageNum, isNewFilter = false) => {
        try {
            setLoading(true);
            const data = await getAllReports(pageNum, 10, filters);

            if (isNewFilter) {
                setReports(data.data.reports);
            } else {
                setReports(prev => [...prev, ...data.data.reports]);
            }

            setHasMore(data.data.pagination.page < data.data.pagination.pages);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchReports(1, true);
    }, [filters]);

    useEffect(() => {
        if (page > 1) {
            fetchReports(page);
        }
    }, [page]);

    useEffect(() => {
        // Listen for new reports
        const unsubscribeNew = socketService.on("new_report", (data) => {
            // Only add if it matches current filters
            // This is a simplified check, ideally we'd check all filters
            if (filters.category && filters.category !== data.data.category) return;
            if (filters.severity && data.data.severity < parseInt(filters.severity)) return;
            if (filters.status && filters.status !== data.data.status) return;

            setReports(prev => [data.data, ...prev]);
        });

        // Listen for updates
        const unsubscribeUpdate = socketService.on("report_update", (data) => {
            setReports(prev => prev.map(report =>
                report._id === data.reportId
                    ? { ...report, ...data.data }
                    : report
            ));
        });

        return () => {
            unsubscribeNew();
            unsubscribeUpdate();
        };
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Campus Feed</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-primary-50 text-primary-600" : ""}
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 animate-fade-in">
                        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange("category", e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                >
                                    <option value="">All Categories</option>
                                    {Object.entries(REPORT_CATEGORIES).map(([key, value]) => (
                                        <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => handleFilterChange("severity", e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                >
                                    <option value="">Any Severity</option>
                                    <option value="1">1+ (Low)</option>
                                    <option value="2">2+ (Moderate)</option>
                                    <option value="3">3+ (Medium)</option>
                                    <option value="4">4+ (High)</option>
                                    <option value="5">5 (Critical)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                >
                                    <option value="">All Active</option>
                                    <option value="reported">Reported</option>
                                    <option value="verified">Verified</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Sort By</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="severity_desc">Highest Severity</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {reports.length === 0 && !loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No reports found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters</p>
                    </div>
                ) : (
                    reports.map((report, index) => {
                        if (reports.length === index + 1) {
                            return (
                                <div ref={lastReportElementRef} key={report._id}>
                                    <ReportCard report={report} />
                                </div>
                            );
                        } else {
                            return <ReportCard key={report._id} report={report} />;
                        }
                    })
                )}

                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!hasMore && reports.length > 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                        You've reached the end of the feed
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedPage;
