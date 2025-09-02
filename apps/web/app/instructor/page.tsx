'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, Video, DollarSign, Plus, Edit, 
  Trash2, Eye, TrendingUp, Star, MessageSquare, Calendar
} from 'lucide-react';
import { useAuth } from '@/components/providers';
import { api } from '@/lib/api';

interface InstructorStats {
  total_courses: number;
  total_students: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  upcoming_live_classes: number;
  courses: Array<{
    id: string;
    title: string;
    enrollments_count: number;
    average_rating: number;
    revenue: number;
    is_published: boolean;
  }>;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'live-classes' | 'earnings'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        router.push('/');
        return;
      }
      fetchInstructorStats();
    }
  }, [user, authLoading]);

  const fetchInstructorStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instructor/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch instructor stats:', error);
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
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <Link
              href="/instructor/create-course"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Course
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          {['overview', 'courses', 'live-classes', 'earnings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-md font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.replace('-', ' ')}
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
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-3xl font-bold">{stats.total_courses}</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold">{stats.total_students}</p>
                  </div>
                  <Users className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-3xl font-bold">₹{stats.total_revenue}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-3xl font-bold">{stats.average_rating?.toFixed(1) || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{stats.total_reviews} reviews</p>
                  </div>
                  <Star className="h-10 w-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/instructor/create-course" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create New Course</h3>
                    <p className="text-sm text-gray-600">Start building your next course</p>
                  </div>
                </div>
              </Link>

              <Link href="/instructor/schedule-class" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3 mr-4">
                    <Video className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Schedule Live Class</h3>
                    <p className="text-sm text-gray-600">Create a new live session</p>
                  </div>
                </div>
              </Link>

              <Link href="/instructor/analytics" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3 mr-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-gray-600">Track your performance</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Upcoming Live Classes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Live Classes ({stats.upcoming_live_classes})
              </h3>
              {stats.upcoming_live_classes === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming live classes scheduled</p>
              ) : (
                <p className="text-gray-500 text-center py-8">Live class schedule will appear here</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Link
                href="/instructor/create-course"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </div>
            <div className="divide-y">
              {stats.courses?.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
                  <Link
                    href="/instructor/create-course"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Link>
                </div>
              ) : (
                stats.courses?.map((course) => (
                  <div key={course.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {!course.is_published && (
                            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrollments_count} students
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {course.average_rating?.toFixed(1) || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ₹{course.revenue}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/instructor/edit-course/${course.id}`}
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button className="p-2 text-gray-600 hover:text-red-600">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'live-classes' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Live Classes</h2>
              <Link
                href="/instructor/schedule-class"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule Class
              </Link>
            </div>
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Live class management coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Earnings Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">₹0</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-2xl font-bold">₹0</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">₹{stats.total_revenue}</p>
              </div>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">Detailed earnings analytics coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}