export type UserProfile = {
  id: string
  username: string
  name: string | null
  bio: string | null
  avatar: string | null
  website: string | null
  email: string
  createdAt: Date
  _count: {
    posts: number
    followers: number
    following: number
  }
  isFollowing?: boolean
  followers?: any
}

export type PostWithDetails = {
  id: string
  caption: string | null
  mediaUrl: string
  mediaType: string
  createdAt: Date
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  _count: {
    likes: number
    comments: number
  }
  likes: { userId: string }[]
  comments?: CommentWithUser[]
}

export type CommentWithUser = {
  id: string
  text: string
  createdAt: Date
  user: {
    id: string
    username: string
    avatar: string | null
  }
}

export type NotificationItem = {
  id: string
  type: 'like' | 'comment' | 'follow'
  read: boolean
  createdAt: Date
  from: {
    id: string
    username: string
    avatar: string | null
  }
  post?: {
    id: string
    mediaUrl: string
  }
}

export type FeedResponse = {
  posts: PostWithDetails[]
  nextCursor?: string
  hasMore: boolean
}
