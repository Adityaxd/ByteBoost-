'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Users, Calendar, Clock, Play, User, Globe } from 'lucide-react';
import { liveAPI } from '@/lib/api';
import { useAuth } from '@/components/providers';

interface LiveRoom {
  id: string;
  name: string;
  description: string;
  course_id: string;
  course: {
    title: string;
    instructor: {
      full_name: string;
    };
  };
  host_id: string;
  is_active: boolean;
  scheduled_at: string;
  max_participants: number;
  current_participants: number;
  meeting_url: string;
}

export default function LiveClassesPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled'>('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await liveAPI.listRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filter === 'active') return room.is_active;
    if (filter === 'scheduled') return !room.is_active && new Date(room.scheduled_at) > new Date();
    return true;
  });

  const formatScheduledTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Started';
    if (diffHours < 1) return 'Starting soon';
    if (diffHours < 24) return `In ${diffHours} hours`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      alert('Please login to join live classes');
      return;
    }

    try {
      const response = await liveAPI.joinRoom(roomId);
      // Open meeting URL in new tab
      const room = rooms.find(r => r.id === roomId);
      if (room?.meeting_url) {
        window.open(room.meeting_url, '_blank');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join the live class. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-4">Live Classes</h1>
          <p className="text-xl text-purple-100">Join interactive sessions with expert instructors in real-time</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-2 inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Live Now
            </span>
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'scheduled' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Live Classes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No live classes available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Room Header with Live Indicator */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Video className="h-16 w-16 text-white opacity-50" />
                  {room.is_active && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                      LIVE
                    </div>
                  )}
                  {!room.is_active && (
                    <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      {formatScheduledTime(room.scheduled_at)}
                    </div>
                  )}
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
                  
                  {/* Course Info */}
                  <div className="text-sm text-gray-500 mb-3">
                    <p className="font-medium text-gray-700">{room.course?.title}</p>
                    <p>Instructor: {room.course?.instructor?.full_name}</p>
                  </div>

                  {/* Room Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {room.current_participants}/{room.max_participants}
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Interactive
                    </div>
                  </div>

                  {/* Join Button */}
                  {room.is_active ? (
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Join Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 rounded-md font-semibold cursor-not-allowed flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatScheduledTime(room.scheduled_at)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">How Live Classes Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Schedule</h3>
              <p className="text-gray-600">Browse upcoming live classes and mark your calendar</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Join Live</h3>
              <p className="text-gray-600">Click to join when the class goes live</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Interact</h3>
              <p className="text-gray-600">Ask questions and interact with instructors in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}