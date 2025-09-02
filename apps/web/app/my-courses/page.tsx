'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle, PlayCircle, Award, TrendingUp } from 'lucide-react';
import { courseAPI } from '@/lib/api';
import { useAuth } from '@/components/providers';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_hours: number;
  modules_count: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
  instructor: {
    full_name: string;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user, authLoading]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.list({ enrolled: true });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'completed') return course.progress_percentage === 100;
    if (filter === 'in-progress') return course.progress_percentage > 0 && course.progress_percentage < 100;
    return true;
  });

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    if (percentage >= 25) return 'bg-orange-600';
    return 'bg-gray-400';
  };

  const formatLastAccessed = (dateString: string) => {
    if (!dateString) return 'Not started';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="mt-2 text-gray-600">Continue your learning journey</p>
            </div>
            <Link
              href="/courses"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-gray-600">Enrolled Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100).length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.progress_percentage === 100).length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.progress_percentage === 100).length}
                </p>
                <p className="text-sm text-gray-600">Certificates Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-2 inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'in-progress' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Progress ({courses.filter(c => c.progress_percentage > 0 && c.progress_percentage < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({courses.filter(c => c.progress_percentage === 100).length})
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't enrolled in any courses yet."
                : filter === 'in-progress'
                ? "You don't have any courses in progress."
                : "You haven't completed any courses yet."}
            </p>
            {filter === 'all' && (
              <Link
                href="/courses"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    {course.progress_percentage === 100 && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">by {course.instructor?.full_name}</p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(course.progress_percentage || 0)}`}
                          style={{ width: `${course.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        {course.completed_lessons || 0}/{course.total_lessons || 0} lessons
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatLastAccessed(course.last_accessed_at)}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
                      {course.progress_percentage === 0 
                        ? 'Start Course'
                        : course.progress_percentage === 100
                        ? 'Review Course'
                        : 'Continue Learning'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}