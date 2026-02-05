 export type AppRole = 'owner' | 'admin' | 'moderator' | 'support' | 'vip' | 'member';
 
 export interface UserRole {
   id: string;
   user_id: string;
   role: AppRole;
   created_at: string;
 }
 
 export interface Profile {
   id: string;
   user_id: string;
   username: string;
   avatar_url: string | null;
   bio: string | null;
   signature: string | null;
   posts_count: number;
   topics_count: number;
   reputation: number;
   is_online: boolean;
   last_seen: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface ForumCategory {
   id: string;
   name: string;
   description: string | null;
   icon: string | null;
   sort_order: number;
   parent_id: string | null;
   is_visible: boolean;
   can_view_roles: AppRole[];
   can_post_roles: AppRole[];
   topics_count: number;
   posts_count: number;
   created_at: string;
   updated_at: string;
 }
 
 export interface ForumTopic {
   id: string;
   category_id: string;
   author_id: string | null;
   title: string;
   content: string;
   is_pinned: boolean;
   is_locked: boolean;
   is_hidden: boolean;
   views_count: number;
   replies_count: number;
   last_reply_at: string | null;
   last_reply_by: string | null;
   created_at: string;
   updated_at: string;
   author?: Profile;
   category?: ForumCategory;
 }
 
 export interface ForumPost {
   id: string;
   topic_id: string;
   author_id: string | null;
   content: string;
   is_hidden: boolean;
   likes_count: number;
   created_at: string;
   updated_at: string;
   author?: Profile;
 }
 
 export interface PostLike {
   id: string;
   post_id: string;
   user_id: string;
   created_at: string;
 }
 
 export const ROLE_HIERARCHY: Record<AppRole, number> = {
   owner: 1,
   admin: 2,
   moderator: 3,
   support: 4,
   vip: 5,
   member: 6,
 };
 
 export const ROLE_LABELS: Record<AppRole, string> = {
   owner: 'Власник',
   admin: 'Адміністратор',
   moderator: 'Модератор',
   support: 'Підтримка',
   vip: 'VIP',
   member: 'Учасник',
 };
 
 export const ROLE_COLORS: Record<AppRole, string> = {
   owner: 'rank-owner',
   admin: 'rank-admin',
   moderator: 'rank-moderator',
   support: 'rank-support',
   vip: 'rank-vip',
   member: 'rank-member',
 };