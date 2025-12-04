import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { formatDate } from "../../utils/helpers";
import { Users as UsersIcon, Search, Filter, Shield, UserPlus, Ban, CheckCircle, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({ name: "", email: "" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("/admin/users");
            setUsers(response.data.data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, isBanned) => {
        try {
            await apiClient.patch(`/admin/users/${userId}`, { isBanned: !isBanned });
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user");
        }
    };

    const handleInviteModerator = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post("/admin/moderators", inviteData);
            setShowInviteModal(false);
            setInviteData({ name: "", email: "" });
            fetchUsers();
            alert("Moderator invited successfully");
        } catch (error) {
            console.error("Error inviting moderator:", error);
            alert(error.response?.data?.message || "Failed to invite moderator");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiClient.patch(`/admin/users/${userId}`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update user role");
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        const colors = {
            student: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
            moderator: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
            admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            security: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        };
        return colors[role] || "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-500 rounded-lg text-white shadow-lg shadow-primary-500/30">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                User Management
                            </h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg ml-11">
                            Manage users, roles, and permissions
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Invite Moderator
                    </Button>
                </div>

                {/* Filters */}
                <Card className="p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Users</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                                />
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filter by Role</label>
                            <div className="relative">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-slate-900 dark:text-white appearance-none transition-all"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                    <option value="security">Security</option>
                                </select>
                                <Filter className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Users Table */}
                <Card className="overflow-hidden mb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No users found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                                        {user.name?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${getRoleBadgeColor(
                                                        user.role
                                                    )}`}
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="security">Security</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.isBanned ? (
                                                    <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                                                        <Ban className="w-3 h-3" /> Banned
                                                    </span>
                                                ) : user.isVerified ? (
                                                    <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                {formatDate(user.createdAt, "MMM d, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Button
                                                    onClick={() => handleBlockUser(user._id, user.isBanned)}
                                                    variant={user.isBanned ? "default" : "outline"}
                                                    className={user.isBanned
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                                    }
                                                    size="sm"
                                                >
                                                    {user.isBanned ? "Unban User" : "Ban User"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{users.length}</p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Students</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            {users.filter((u) => u.role === "student").length}
                        </p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Moderators</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            {users.filter((u) => u.role === "moderator").length}
                        </p>
                    </Card>
                    <Card className="p-6">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Banned</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                            {users.filter((u) => u.isBanned).length}
                        </p>
                    </Card>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <Card className="max-w-md w-full p-8 transform transition-all scale-100">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Invite Moderator</h2>
                        <form onSubmit={handleInviteModerator}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={inviteData.name}
                                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-slate-900 dark:text-white transition-all"
                                    placeholder="Enter name"
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-slate-900 dark:text-white transition-all"
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowInviteModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                >
                                    Send Invitation
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Users;
