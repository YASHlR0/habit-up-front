import { httpClient } from './httpClient';
import { getApiBaseUrl } from './apiBaseUrl';

export interface CommunityPost {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  userId: number;
  username: string;
  userAvatar?: string | null;
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return httpClient.get<CommunityPost[]>('/posts');
}

export async function createCommunityPost(userId: number, content: string): Promise<CommunityPost> {
  return httpClient.post<CommunityPost>(`/posts/user/${userId}`, { content });
}

export async function getUserPosts(userId: number): Promise<CommunityPost[]> {
  return httpClient.get<CommunityPost[]>(`/posts/user/${userId}`);
}

export async function likeCommunityPost(postId: number): Promise<CommunityPost> {
  return httpClient.post<CommunityPost>(`/posts/${postId}/like`);
}

export async function deleteCommunityPost(postId: number, userId: number): Promise<void> {
  return httpClient.delete<void>(`/posts/${postId}`, { params: { userId } });
}

export async function addCommunityComment(postId: number, userId: number, content: string): Promise<{ message: string }> {
  return httpClient.post<{ message: string }>(`/comments/post/${postId}/user/${userId}`, { content });
}

export async function getPostComments(postId: number): Promise<Comment[]> {
  console.log(`🔍 Obteniendo comentarios del post ${postId}:`, {
    url: `${getApiBaseUrl()}/comments/post/${postId}`
  });
  
  try {
    const comments = await httpClient.get<Comment[]>(`/comments/post/${postId}`);
    console.log(`✅ Comentarios obtenidos del post ${postId}:`, comments);
    return comments;
  } catch (error) {
    console.error(`❌ Error obteniendo comentarios del post ${postId}:`, {
      error: error.message,
      status: error.status,
      url: `${getApiBaseUrl()}/comments/post/${postId}`
    });
    throw error;
  }
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  user: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

