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
import { useTranslation } from 'react-i18next';
import { useTitle } from '@/context/TitleContext';
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

interface ShopData {
  id: string;
  name: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  phone?: string;
  address?: string;
}

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
  shop?: ShopData;
  shops?: ShopData[];
}

export default function Profile() {
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setTitle(t("profile.title"));
    return () => setTitle("");
  }, [setTitle, t]);
  
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
      toast({ title: t('profile.toast.success'), description: t('profile.toast.profile_updated') });
      if (response?.user) {
        setUser(response.user);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    },
    onError: (error: Error) => {
      toast({ title: t('profile.toast.error'), description: error.message, variant: 'destructive' });
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest('PUT', '/api/auth/password', data);
    },
    onSuccess: () => {
      toast({ title: t('profile.toast.success'), description: t('profile.toast.password_updated') });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: Error) => {
      toast({ title: t('profile.toast.error'), description: error.message, variant: 'destructive' });
    }
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/users/request-password-reset', { message: 'Password reset requested from profile page' });
    },
    onSuccess: () => {
      toast({ 
        title: t('profile.toast.request_sent_title'), 
        description: t('profile.toast.request_sent_description') 
      });
    },
    onError: (error: Error) => {
      toast({ title: t('profile.toast.error'), description: error.message, variant: 'destructive' });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: t('profile.toast.error'), description: t('profile.toast.passwords_mismatch'), variant: 'destructive' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({ title: t('profile.toast.error'), description: t('profile.toast.password_too_short'), variant: 'destructive' });
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const getRoleLabel = (role: string) => {
    return t(`profile.roles.${role}`, { defaultValue: role });
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
  const shopsData = profileData?.shops || (profileData?.shop ? [profileData.shop] : []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold">{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
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

      {shopsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {shopsData.length > 1 ? t('profile.shops_info.title') : t('profile.shop_info.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shopsData.map((shop, index) => (
                <div key={shop.id} className={index > 0 ? "pt-6 border-t" : ""}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">{t('profile.shop_info.shop_name')}</Label>
                      <p className="font-medium" data-testid={`text-shop-name-${shop.id}`}>{shop.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('profile.shop_info.subscription')}</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-subscription-${shop.id}`}>{shop.subscriptionTier}</Badge>
                        <Badge 
                          variant={shop.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                          data-testid={`badge-subscription-status-${shop.id}`}
                        >
                          {shop.subscriptionStatus}
                        </Badge>
                      </div>
                    </div>
                    {shop.phone && (
                      <div>
                        <Label className="text-muted-foreground">{t('profile.shop_info.phone')}</Label>
                        <p className="font-medium">{shop.phone}</p>
                      </div>
                    )}
                    {shop.address && (
                      <div>
                        <Label className="text-muted-foreground">{t('profile.shop_info.address')}</Label>
                        <p className="font-medium">{shop.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">{t('profile.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="password" data-testid="tab-password">{t('profile.tabs.password')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.form.title')}</CardTitle>
              <CardDescription>{t('profile.form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('profile.form.username')}
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
                      {t('profile.form.email')}
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
                      {t('profile.form.phone')}
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
                    <Label htmlFor="whatsapp">{t('profile.form.whatsapp')}</Label>
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
                      {t('profile.form.address')}
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
                        {t('profile.form.business_name')}
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
                        {t('profile.form.currency')}
                      </Label>
                      <Select
                        value={profileForm.currencyCode}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger data-testid="select-profile-currency">
                          <SelectValue placeholder={t('profile.form.select_currency')} />
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
                        {t('profile.form.currency_description')}
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
                  {t('profile.form.save_changes')}
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
                {t('profile.password.title')}
              </CardTitle>
              <CardDescription>
                {isSalesPerson 
                  ? t('profile.password.description_sales')
                  : t('profile.password.description_admin')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSalesPerson ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('profile.password.sales_info')}
                  </p>
                  <Button 
                    onClick={() => requestPasswordResetMutation.mutate()}
                    disabled={requestPasswordResetMutation.isPending}
                    data-testid="button-request-reset"
                  >
                    {requestPasswordResetMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {t('profile.password.request_reset')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('profile.password.current_password')}</Label>
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
                    <Label htmlFor="newPassword">{t('profile.password.new_password')}</Label>
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
                    <Label htmlFor="confirmPassword">{t('profile.password.confirm_password')}</Label>
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
                    {t('profile.password.update_button')}
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
              {t('profile.currency_warning.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.currency_warning.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelCurrencyChange} data-testid="button-cancel-currency-change">
              {t('profile.currency_warning.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCurrencyChange} data-testid="button-confirm-currency-change">
              {t('profile.currency_warning.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
