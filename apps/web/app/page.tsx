import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Video, Award, Clock, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Access world-class courses, live classes, and expert instructors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50"
              >
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/live-classes"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
              >
                Join Live Classes
                <Video className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose ByteBoost?</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to succeed in your learning journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comprehensive Courses</h3>
              <p className="text-gray-600">
                Structured video courses with downloadable resources, quizzes, and certificates
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-md mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Interactive Classes</h3>
              <p className="text-gray-600">
                Join real-time sessions with instructors and collaborate with peers
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-md mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Certificates</h3>
              <p className="text-gray-600">
                Earn recognized certificates upon successful completion of courses
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-md mb-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn at Your Pace</h3>
              <p className="text-gray-600">
                Access courses anytime, anywhere, and progress at your own speed
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-md mb-4">
                <Video className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HD Video Content</h3>
              <p className="text-gray-600">
                High-quality video lessons with adaptive streaming for smooth playback
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-md mb-4">
                <Globe className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Community</h3>
              <p className="text-gray-600">
                Connect with learners worldwide through comments and discussions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Learning Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already learning on ByteBoost
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600 mt-2">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 mt-2">Video Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600 mt-2">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 mt-2">Live Classes Daily</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}