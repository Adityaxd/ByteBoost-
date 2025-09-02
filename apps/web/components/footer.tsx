import Link from 'next/link';
import { Book, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Book className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold">ByteBoost</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering learners with cutting-edge courses and live classes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Learn</h3>
            <ul className="space-y-2">
              <li><Link href="/courses" className="text-gray-400 hover:text-white text-sm">All Courses</Link></li>
              <li><Link href="/live-classes" className="text-gray-400 hover:text-white text-sm">Live Classes</Link></li>
              <li><Link href="/instructors" className="text-gray-400 hover:text-white text-sm">Instructors</Link></li>
              <li><Link href="/certificates" className="text-gray-400 hover:text-white text-sm">Certificates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white text-sm">Careers</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-gray-400 hover:text-white text-sm">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ByteBoost. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}