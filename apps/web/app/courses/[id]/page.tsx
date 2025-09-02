'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Lock, CheckCircle, Clock, Users, Star, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { courseAPI, paymentAPI } from '@/lib/api';
import { useAuth } from '@/components/providers';
import VideoPlayer from '@/components/video-player';
import Comments from '@/components/comments';

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  duration_hours: number;
  level: string;
  category: string;
  instructor: {
    id: string;
    full_name: string;
    bio: string;
  };
  modules: Module[];
  is_enrolled: boolean;
  enrollments_count: number;
  average_rating: number;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.get(params.id as string);
      setCourse(response.data);
      
      // Auto-select first lesson if enrolled
      if (response.data.is_enrolled && response.data.modules.length > 0) {
        const firstModule = response.data.modules[0];
        if (firstModule.lessons.length > 0) {
          setSelectedLesson(firstModule.lessons[0]);
          setExpandedModules(new Set([firstModule.id]));
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (course?.price === 0) {
      // Free course - direct enrollment
      try {
        setEnrolling(true);
        await courseAPI.enroll(course.id);
        await fetchCourse();
      } catch (error) {
        console.error('Failed to enroll:', error);
      } finally {
        setEnrolling(false);
      }
    } else {
      // Paid course - initiate payment
      router.push(`/payment/${course?.id}`);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span>{course.average_rating?.toFixed(1) || 'N/A'} rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{course.enrollments_count} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{course.duration_hours} hours</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm">Created by</p>
                <p className="text-lg font-semibold">{course.instructor.full_name}</p>
              </div>
            </div>

            <div className="bg-white text-gray-900 rounded-lg p-6">
              <div className="aspect-video bg-gray-200 rounded mb-4">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {course.price === 0 ? 'Free' : `₹${course.price}`}
                </span>
              </div>

              {course.is_enrolled ? (
                <button
                  className="w-full bg-green-600 text-white py-3 rounded-md font-semibold"
                  disabled
                >
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  Enrolled
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {enrolling ? 'Processing...' : course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                </button>
              )}

              <div className="mt-4 space-y-2 text-sm">
                <p>✓ Full lifetime access</p>
                <p>✓ Certificate of completion</p>
                <p>✓ {course.modules.length} modules</p>
                <p>✓ Level: {course.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Comments */}
          <div className="lg:col-span-2">
            {selectedLesson && course.is_enrolled ? (
              <>
                <VideoPlayer
                  videoUrl={selectedLesson.video_url}
                  title={selectedLesson.title}
                />
                <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
                  <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                  <p className="text-gray-600">{selectedLesson.description}</p>
                </div>
                <div className="mt-6">
                  <Comments lessonId={selectedLesson.id} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {course.is_enrolled ? 'Select a lesson to start' : 'Enroll to access course content'}
                </h3>
                <p className="text-gray-600">
                  {course.is_enrolled 
                    ? 'Choose a lesson from the course curriculum on the right'
                    : 'Get full access to all course materials, videos, and resources'}
                </p>
              </div>
            )}
          </div>

          {/* Course Curriculum */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {course.modules.length} modules • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </p>
              </div>

              <div className="divide-y">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="text-left">
                        <h4 className="font-semibold">Module {module.order_index}: {module.title}</h4>
                        <p className="text-sm text-gray-600">{module.lessons.length} lessons</p>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="bg-gray-50">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => course.is_enrolled && setSelectedLesson(lesson)}
                            disabled={!course.is_enrolled && !lesson.is_free}
                            className={`w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                              selectedLesson?.id === lesson.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              {course.is_enrolled || lesson.is_free ? (
                                <Play className="h-4 w-4 mr-3 text-gray-600" />
                              ) : (
                                <Lock className="h-4 w-4 mr-3 text-gray-400" />
                              )}
                              <div className="text-left">
                                <p className="text-sm font-medium">{lesson.title}</p>
                                <p className="text-xs text-gray-500">{lesson.duration_minutes} min</p>
                              </div>
                            </div>
                            {lesson.is_free && !course.is_enrolled && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Free</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}