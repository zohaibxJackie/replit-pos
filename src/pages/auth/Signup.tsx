import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useSignup } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const signupMutation = useSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('auth.signup.error_title'),
        description: t('auth.signup.password_mismatch'),
        variant: 'destructive',
      });
      return;
    }

    if (!role) {
      toast({
        title: t('auth.signup.error_title'),
        description: t('auth.signup.role_required'),
        variant: 'destructive',
      });
      return;
    }
    
    signupMutation.mutate(
      { 
        name, 
        email, 
        password, 
        role,
        phone,
        businessName: businessName || name,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.user) {
            toast({
              title: t('auth.signup.success_title'),
              description: t('auth.signup.success_description'),
            });
            
            const userRole = data.user.role;
            if (userRole === 'super_admin') {
              setLocation('/super-admin/dashboard');
            } else if (userRole === 'admin') {
              setLocation('/admin/dashboard');
            } else if (userRole === 'sales_person') {
              setLocation('/pos');
            } else if (userRole === 'wholesaler') {
              setLocation('/wholesaler/dashboard');
            } else if (userRole === 'repair_man') {
              setLocation('/repair-man/dashboard');
            }
          } else {
            toast({
              title: t('auth.signup.error_title'),
              description: data.message || t('auth.signup.error_description'),
              variant: 'destructive',
            });
          }
        },
        onError: (error) => {
          toast({
            title: t('auth.signup.error_title'),
            description: error.message || t('auth.signup.error_description'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const showBusinessNameField = role === 'wholesaler' || role === 'repair_man' || role === 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      
      <Card className="w-full max-w-md p-10 shadow-2xl border-0 backdrop-blur-sm bg-white/90 relative z-10 my-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.signup.title')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">{t('auth.signup.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">{t('auth.signup.name_label') || 'Full Name'}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.signup.name_placeholder') || 'Enter your full name'}
              required
              disabled={signupMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-signup-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">{t('auth.signup.email_label')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signup.email_placeholder')}
              required
              disabled={signupMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-signup-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold">{t('auth.signup.role_label')}</Label>
            <Select value={role} onValueChange={setRole} disabled={signupMutation.isPending}>
              <SelectTrigger className="h-12 rounded-xl border-2 focus:ring-purple-500" data-testid="select-signup-role">
                <SelectValue placeholder={t('auth.signup.role_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" data-testid="option-role-admin">{t('auth.signup.roles.admin') || 'Shop Owner (Admin)'}</SelectItem>
                <SelectItem value="repair_man" data-testid="option-role-repair">{t('auth.signup.roles.repair_man')}</SelectItem>
                <SelectItem value="wholesaler" data-testid="option-role-wholesaler">{t('auth.signup.roles.wholesaler')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {t('auth.signup.sales_person_note') || 'Sales persons can only be added by shop owners (admins) from the dashboard.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold">{t('auth.signup.phone_label')}</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('auth.signup.phone_placeholder')}
              disabled={signupMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-signup-phone"
            />
          </div>

          {showBusinessNameField && (
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-semibold">{t('auth.signup.business_name_label')}</Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={t('auth.signup.business_name_placeholder')}
                disabled={signupMutation.isPending}
                className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
                data-testid="input-signup-business-name"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">{t('auth.signup.password_label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.signup.password_placeholder')}
              required
              disabled={signupMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-signup-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">{t('auth.signup.confirm_password_label')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.signup.confirm_password_placeholder')}
              required
              disabled={signupMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-signup-confirm-password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50" 
            disabled={signupMutation.isPending}
            data-testid="button-signup"
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('auth.signup.creating_account')}
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                {t('auth.signup.sign_up_button')}
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {t('auth.signup.have_account')}{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold" data-testid="link-login">
              {t('auth.signup.sign_in_link')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
