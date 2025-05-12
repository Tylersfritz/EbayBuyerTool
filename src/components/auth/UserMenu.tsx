
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Settings, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const { user, profile, signOut, isPremium } = useAuth();
  
  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      const first = profile.first_name ? profile.first_name[0] : '';
      const last = profile.last_name ? profile.last_name[0] : '';
      return (first + last).toUpperCase();
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };
  
  const displayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    
    if (profile?.first_name) {
      return profile.first_name;
    }
    
    return user?.email?.split('@')[0] || 'User';
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName()} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          {isPremium && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 rounded-full h-5 w-5 flex items-center justify-center">
              <Crown className="h-3 w-3" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName()}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {isPremium && (
              <p className="text-xs flex items-center text-amber-600">
                <Crown className="h-3 w-3 mr-1" /> Premium Member
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/profile">
          <DropdownMenuItem>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
