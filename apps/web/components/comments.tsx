'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';
import { useAuth } from './providers';
import { commentAPI } from '@/lib/api';
import io from 'socket.io-client';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface CommentsProps {
  lessonId: string;
}

export default function Comments({ lessonId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchComments();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [lessonId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(lessonId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = API_URL.replace('http', 'ws') + `/comments/ws/lesson/${lessonId}`;
    
    socketRef.current = io(API_URL, {
      path: '/socket.io/',
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to comments WebSocket');
      socketRef.current.emit('join_lesson', { lesson_id: lessonId });
    });

    socketRef.current.on('new_comment', (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    });

    socketRef.current.on('update_comment', (updatedComment: Comment) => {
      setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    });

    socketRef.current.on('delete_comment', (commentId: string) => {
      setComments(prev => prev.filter(c => c.id !== commentId));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await commentAPI.createComment({
        lesson_id: lessonId,
        content: newComment.trim()
      });
      
      // Comment will be added via WebSocket
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-6 border-b">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 border-b text-center">
          <p className="text-gray-600">Please log in to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.user.full_name}</span>
                    <span className="text-sm text-gray-500">{formatTime(comment.created_at)}</span>
                  </div>
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}