'use client';

import {
  Home,
  Map,
  FileText,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  AlertCircle,
  ShoppingBag,
  BookOpen,
  Gift,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { usePrivyAuth } from './privy-provider';
import { fetcher, getTitleFromChat } from '@/lib/utils';
import { Chat } from '@/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const mainMenuItems = [
  { icon: Home, label: 'Chat', href: '/' },
  { icon: TrendingUp, label: 'Explore', href: '/explore' },
  { icon: Map, label: 'Live Map', href: '/map' },
  { icon: AlertCircle, label: 'Alerts', href: '/alerts' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Heart, label: 'Watchlist', href: '/watchlist' },
];

const exploreMenuItems = [
  { icon: BookOpen, label: 'Docs', href: '/docs' },
  { icon: Users, label: 'About', href: '/about' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace' },
  { icon: Gift, label: 'Rewards', href: '/rewards' },
];

export function SidebarDrawer() {
  const { authenticated } = usePrivyAuth();
  const pathname = usePathname();
  const { id: activeChatId } = useParams();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Close mobile sidebar on navigation
  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  const { data: history, isLoading, mutate } = useSWR<Array<Chat>>(
    authenticated ? '/api/history' : null,
    fetcher,
    { fallbackData: [] }
  );

  useEffect(() => { mutate(); }, [pathname, mutate]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, { method: 'DELETE' });
    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((h) => h?.filter((c) => c.id !== deleteId));
        return 'Chat deleted';
      },
      error: 'Failed to delete chat',
    });
    setShowDeleteDialog(false);
  };

  const recentChats = history?.slice(0, 8) ?? [];

  return (
    <>
      {/* Mobile hamburger button — only visible when sidebar is closed on mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-gray-600" />
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex-shrink-0',
          // Desktop: docked, collapsible
          'md:relative md:translate-x-0',
          isExpanded ? 'md:w-56' : 'md:w-[60px]',
          // Mobile: fixed overlay, full width sidebar, slides in/out
          'fixed inset-y-0 left-0 z-50 w-64 md:w-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 h-[60px] border-b border-gray-100 flex-shrink-0">
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src="/logo.png" width={32} height={32} alt="MamaPrice" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 leading-tight truncate">MamaPrice</p>
                  <p className="text-[10px] text-gray-400 truncate">Know prices. Shop smart.</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0 ml-1"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg overflow-hidden mx-auto flex-shrink-0">
                <Image src="/logo.png" width={32} height={32} alt="MamaPrice" className="w-full h-full object-contain" />
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-3 h-3 text-gray-500" />
              </button>
            </>
          )}
        </div>

        {/* ── Search ── */}
        <div className="px-3 py-2.5 flex-shrink-0">
          {isExpanded ? (
            <div className="flex items-center gap-2 h-8 px-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate">Search anything...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-8 w-full bg-gray-50 rounded-lg border border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )}
        </div>

        {/* ── Nav (scrollable) ── */}
        <nav className="flex-1 px-2 overflow-y-auto scrollbar-hide min-h-0">
          {/* Main section */}
          {isExpanded && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1">
              Main
            </p>
          )}
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  'flex items-center h-9 rounded-lg transition-colors group relative mb-0.5',
                  isExpanded ? 'gap-2.5 px-2' : 'justify-center',
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700')} />
                {isExpanded && (
                  <span className={cn('text-sm font-medium truncate flex-1', active && 'text-emerald-700')}>
                    {item.label}
                  </span>
                )}
                {active && isExpanded && <span className="w-1 h-4 bg-emerald-500 rounded-full flex-shrink-0" />}
                {active && !isExpanded && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-l-full" />}
              </Link>
            );
          })}

          {/* Explore section */}
          {isExpanded ? (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-3 pb-1">
              Explore
            </p>
          ) : (
            <div className="my-2 mx-1 border-t border-gray-100" />
          )}
          {exploreMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  'flex items-center h-9 rounded-lg transition-colors group relative mb-0.5',
                  isExpanded ? 'gap-2.5 px-2' : 'justify-center',
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700')} />
                {isExpanded && (
                  <span className={cn('text-sm font-medium truncate flex-1', active && 'text-emerald-700')}>
                    {item.label}
                  </span>
                )}
                {active && isExpanded && <span className="w-1 h-4 bg-emerald-500 rounded-full flex-shrink-0" />}
                {active && !isExpanded && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-l-full" />}
              </Link>
            );
          })}

          {/* ── Recent chats ── */}
          {isExpanded && (
            <>
              <div className="flex items-center justify-between px-2 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Recent</p>
                <Link href="/" className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium">+ New</Link>
              </div>

              {!authenticated && (
                <p className="text-[11px] text-gray-400 px-2 py-2">Login to see recent chats</p>
              )}

              {authenticated && isLoading && (
                <div className="space-y-1 px-1">
                  {[40, 56, 32, 48].map((w) => (
                    <div key={w} className="h-8 rounded-lg bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}

              {authenticated && !isLoading && recentChats.length === 0 && (
                <p className="text-[11px] text-gray-400 px-2 py-2">No chats yet</p>
              )}

              {authenticated && recentChats.map((chat) => {
                const isActiveChat = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    className={cn(
                      'group flex items-center h-8 rounded-lg mb-0.5 pr-1 transition-colors',
                      isActiveChat ? 'bg-emerald-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <Link
                      href={`/chat/${chat.id}`}
                      className={cn(
                        'flex items-center gap-2 flex-1 min-w-0 h-full pl-2',
                        isActiveChat ? 'text-emerald-700' : 'text-gray-600'
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <span className="text-xs truncate">{getTitleFromChat(chat)}</span>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all flex-shrink-0">
                          <MoreHorizontal className="w-3 h-3 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="z-50">
                        <DropdownMenuItem
                          className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => { setDeleteId(chat.id); setShowDeleteDialog(true); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </>
          )}

          {/* Upgrade card (expanded only) */}
          {isExpanded && (
            <div className="mt-3 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                    <circle
                      cx="20" cy="20" r="16" fill="none"
                      stroke="#10b981" strokeWidth="3.5" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * 0.4}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">60%</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">Used capacity</p>
                  <p className="text-[10px] text-gray-500 leading-snug mt-0.5">60% of capacity used.</p>
                </div>
              </div>
              <button className="w-full h-7 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg transition-colors">
                Upgrade plan
              </button>
            </div>
          )}
        </nav>

        {/* ── Bottom actions ── */}
        <div className="px-2 pb-1 flex-shrink-0 space-y-0.5">
          <Link
            href="/settings"
            title={!isExpanded ? 'Settings' : undefined}
            className={cn(
              'flex items-center h-9 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group',
              isExpanded ? 'gap-2.5 px-2' : 'justify-center'
            )}
          >
            <Settings className="w-4 h-4 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <Link
            href="/help"
            title={!isExpanded ? 'Help' : undefined}
            className={cn(
              'flex items-center h-9 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group',
              isExpanded ? 'gap-2.5 px-2' : 'justify-center'
            )}
          >
            <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Help</span>}
          </Link>
        </div>

        {/* ── User Profile ── */}
        <div className="px-2 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
          {isExpanded ? (
            <div className="flex items-center gap-2 px-1 h-11">
              <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-sm flex-shrink-0">👩</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate leading-tight">Amina Yusuf</p>
                <p className="text-[10px] text-gray-400 truncate">amina@marketmama.ai</p>
              </div>
              <button className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0" title="Logout">
                <LogOut className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center pt-1">
              <div className="w-7 h-7 rounded-full bg-emerald-200 flex items-center justify-center text-sm" title="Amina Yusuf">👩</div>
            </div>
          )}
        </div>
      </aside>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The chat will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
