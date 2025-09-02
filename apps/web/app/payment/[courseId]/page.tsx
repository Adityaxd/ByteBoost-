'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';
import { courseAPI, paymentAPI } from '@/lib/api';
import { useAuth } from '@/components/providers';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: {
    full_name: string;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.get(params.courseId as string);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!course || !user) return;

    try {
      setProcessing(true);

      // Create order on backend
      const orderResponse = await paymentAPI.createOrder({
        course_id: course.id,
        amount: course.price
      });

      const order = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ByteBoost',
        description: `Payment for ${course.title}`,
        order_id: order.razorpay_order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id
            });

            if (verifyResponse.data.status === 'completed') {
              // Enrollment happens automatically on backend
              router.push(`/courses/${course.id}?enrolled=true`);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Payment Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
            <p className="mt-2 text-gray-600">Secure payment powered by Razorpay</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="border rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <p className="text-sm text-gray-500">Instructor: {course.instructor.full_name}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Price</span>
                  <span className="font-semibold">₹{course.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{Math.round(course.price * 0.18)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-blue-600">
                      ₹{Math.round(course.price * 1.18)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Instant access after payment
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold">UPI / Cards / Net Banking</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pay securely using UPI, Credit/Debit cards, or Net Banking through Razorpay
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-green-600" />
                      <span>PCI DSS Compliant</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : `Pay ₹${Math.round(course.price * 1.18)}`}
                </button>

                <p className="text-xs text-center text-gray-500">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>

          {/* What You'll Get */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">What You'll Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Lifetime Access</p>
                  <p className="text-sm text-gray-600">Learn at your own pace</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Certificate</p>
                  <p className="text-sm text-gray-600">Get certified on completion</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Support</p>
                  <p className="text-sm text-gray-600">Get help when you need it</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}