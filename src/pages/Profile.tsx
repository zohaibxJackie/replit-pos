import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Building, Lock, Loader2, Save, Coins, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileData {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: 'super_admin' | 'admin' | 'sales_person' | 'repair_man' | 'wholesaler';
    businessName?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    active: boolean;
    shopId?: string;
    shopName?: string;
    currencyCode?: string;
  };
  shop?: {
    id: string;
    name: string;
    subscriptionTier: string;
    subscriptionStatus: string;
    phone?: string;
    address?: string;
  };
}

export default function Profile() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    businessName: '',
    phone: '',
    whatsapp: '',
    address: '',
    currencyCode: user?.currencyCode || 'USD'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrencyWarning, setShowCurrencyWarning] = useState(false);
  const [pendingCurrencyChange, setPendingCurrencyChange] = useState<string | null>(null);

  const { data: profileData, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/users/profile'],
    enabled: !!user
  });

  useEffect(() => {
    if (profileData?.user) {
      setProfileForm({
        username: profileData.user.username || '',
        email: profileData.user.email || '',
        businessName: profileData.user.businessName || '',
        phone: profileData.user.phone || '',
        whatsapp: profileData.user.whatsapp || '',
        address: profileData.user.address || '',
        currencyCode: profileData.user.currencyCode || 'USD'
      });
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      return apiRequest<{ user: ProfileData['user']; message: string }>('PUT', '/api/users/profile', data);
    },
    onSuccess: (response) => {
      toast({ title: 'Success', description: 'Profile updated successfully' });
      if (response?.user) {
        setUser(response.user);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest('PUT', '/api/auth/password', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/users/request-password-reset', { message: 'Password reset requested from profile page' });
    },
    onSuccess: () => {
      toast({ 
        title: 'Request Sent', 
        description: 'Your password reset request has been sent to the administrator.' 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      sales_person: 'Sales Person',
      repair_man: 'Repair Technician',
      wholesaler: 'Wholesaler'
    };
    return labels[role] || role;
  };

  const isSalesPerson = user?.role === 'sales_person';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency !== profileForm.currencyCode) {
      setPendingCurrencyChange(newCurrency);
      setShowCurrencyWarning(true);
    }
  };

  const confirmCurrencyChange = () => {
    if (pendingCurrencyChange) {
      setProfileForm({ ...profileForm, currencyCode: pendingCurrencyChange });
      setPendingCurrencyChange(null);
    }
    setShowCurrencyWarning(false);
  };

  const cancelCurrencyChange = () => {
    setPendingCurrencyChange(null);
    setShowCurrencyWarning(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userData = profileData?.user || user;
  const shopData = profileData?.shop;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold" data-testid="text-username">{userData?.username}</h2>
              <p className="text-muted-foreground" data-testid="text-email">{userData?.email}</p>
              <Badge className="mt-2" data-testid="badge-role">{getRoleLabel(userData?.role || '')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {shopData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Shop Name</Label>
                <p className="font-medium" data-testid="text-shop-name">{shopData.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Subscription</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" data-testid="badge-subscription">{shopData.subscriptionTier}</Badge>
                  <Badge 
                    variant={shopData.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                    data-testid="badge-subscription-status"
                  >
                    {shopData.subscriptionStatus}
                  </Badge>
                </div>
              </div>
              {shopData.phone && (
                <div>
                  <Label className="text-muted-foreground">Shop Phone</Label>
                  <p className="font-medium">{shopData.phone}</p>
                </div>
              )}
              {shopData.address && (
                <div>
                  <Label className="text-muted-foreground">Shop Address</Label>
                  <p className="font-medium">{shopData.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">Profile Details</TabsTrigger>
          <TabsTrigger value="password" data-testid="tab-password">Change Password</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      defaultValue={userData?.username}
                      data-testid="input-profile-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      defaultValue={userData?.email}
                      data-testid="input-profile-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      defaultValue={userData?.phone || ''}
                      data-testid="input-profile-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={profileForm.whatsapp}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      defaultValue={userData?.whatsapp || ''}
                      data-testid="input-profile-whatsapp"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      defaultValue={userData?.address || ''}
                      data-testid="input-profile-address"
                    />
                  </div>
                  {!isSalesPerson && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="businessName" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        value={profileForm.businessName}
                        onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                        defaultValue={userData?.businessName || ''}
                        data-testid="input-profile-business"
                      />
                    </div>
                  )}
                  {isAdmin && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="currency" className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        Display Currency
                      </Label>
                      <Select
                        value={profileForm.currencyCode}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger data-testid="select-profile-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} - {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        This currency will be used for displaying all monetary values across your shops.
                      </p>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                {isSalesPerson 
                  ? 'Contact your administrator to reset your password'
                  : 'Update your password to keep your account secure'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSalesPerson ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    As a sales person, you cannot change your password directly. 
                    Please request a password reset from your administrator.
                  </p>
                  <Button 
                    onClick={() => requestPasswordResetMutation.mutate()}
                    disabled={requestPasswordResetMutation.isPending}
                    data-testid="button-request-reset"
                  >
                    {requestPasswordResetMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Request Password Reset
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      data-testid="input-current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={6}
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button type="submit" disabled={updatePasswordMutation.isPending} data-testid="button-update-password">
                    {updatePasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showCurrencyWarning} onOpenChange={setShowCurrencyWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Change Display Currency?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing your currency will only affect how values are displayed going forward. 
              Historical reports may show incorrect currency symbols for past transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelCurrencyChange} data-testid="button-cancel-currency-change">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCurrencyChange} data-testid="button-confirm-currency-change">
              Change Currency
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
