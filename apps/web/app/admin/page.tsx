'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BookOpen, Video, DollarSign, TrendingUp, 
  Calendar, Award, AlertCircle, BarChart3, Settings,
  UserCheck, BookOpenCheck, PlayCircle, CreditCard
} from 'lucide-react';
import { useAuth } from '@/components/providers';
import { api } from '@/lib/api';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  pending_payments: number;
  live_classes_today: number;
  certificates_issued: number;
  user_growth_percentage: number;
  revenue_growth_percentage: number;
  popular_courses: Array<{
    id: string;
    title: string;
    enrollments: number;
  }>;
  recent_enrollments: Array<{
    id: string;
    user_name: string;
    course_title: string;
    enrolled_at: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'payments'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchDashboardStats();
    }
  }, [user, authLoading]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          {['overview', 'users', 'courses', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-md font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.total_users}</p>
                    <p className="text-sm text-green-600 mt-1">
                      +{stats.user_growth_percentage}% this month
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold">{stats.total_courses}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.total_enrollments} enrollments
                    </p>
                  </div>
                  <BookOpen className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">₹{stats.total_revenue}</p>
                    <p className="text-sm text-green-600 mt-1">
                      +{stats.revenue_growth_percentage}% this month
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Live Classes Today</p>
                    <p className="text-2xl font-bold">{stats.live_classes_today}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.active_users} active now
                    </p>
                  </div>
                  <Video className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Popular Courses */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Popular Courses
                </h3>
                <div className="space-y-3">
                  {stats.popular_courses?.slice(0, 5).map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-500 mr-3">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium">{course.title}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {course.enrollments} students
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                  Recent Enrollments
                </h3>
                <div className="space-y-3">
                  {stats.recent_enrollments?.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{enrollment.user_name}</p>
                        <p className="text-xs text-gray-500">{enrollment.course_title}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.certificates_issued}</p>
                <p className="text-xs text-gray-600">Certificates Issued</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <CreditCard className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.pending_payments}</p>
                <p className="text-xs text-gray-600">Pending Payments</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <BookOpenCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.total_enrollments}</p>
                <p className="text-xs text-gray-600">Total Enrollments</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <PlayCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.active_users}</p>
                <p className="text-xs text-gray-600">Active Users</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">User management interface coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Course Management</h2>
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Course management interface coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Payment management interface coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}