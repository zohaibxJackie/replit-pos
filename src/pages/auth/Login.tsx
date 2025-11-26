import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.success && data.user) {
            toast({
              title: t('auth.login.success_title'),
              description: t('auth.login.success_description', { name: data.user.name }),
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
              title: t('auth.login.error_title'),
              description: data.message || t('auth.login.error_description'),
              variant: 'destructive',
            });
          }
        },
        onError: (error) => {
          toast({
            title: t('auth.login.error_title'),
            description: error.message || t('auth.login.error_description'),
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      
      <Card className="w-full max-w-md p-10 shadow-2xl border-0 backdrop-blur-sm bg-white/90 relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.login.title')}
        </h1>
        <p className="text-center text-muted-foreground mb-8">{t('auth.login.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">{t('auth.login.email_label') || 'Email'}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.email_placeholder') || 'Enter your email'}
              required
              disabled={loginMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">{t('auth.login.password_label')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.password_placeholder')}
              required
              disabled={loginMutation.isPending}
              className="h-12 rounded-xl border-2 focus-visible:ring-purple-500"
              data-testid="input-password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50" 
            disabled={loginMutation.isPending}
            data-testid="button-login"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('auth.login.signing_in')}
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                {t('auth.login.sign_in_button')}
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {t('auth.login.no_account')}{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold" data-testid="link-signup">
              {t('auth.login.sign_up_link')}
            </Link>
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <p className="text-center text-sm font-semibold text-foreground mb-3">{t('auth.demo_accounts.title')}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t('auth.demo_accounts.super_admin')}:</span>
              <code className="px-2 py-1 bg-white rounded-lg text-xs font-mono">superadmin@pos.com / admin123</code>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t('auth.demo_accounts.admin')}:</span>
              <code className="px-2 py-1 bg-white rounded-lg text-xs font-mono">admin@pos.com / admin123</code>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t('auth.demo_accounts.sales')}:</span>
              <code className="px-2 py-1 bg-white rounded-lg text-xs font-mono">sales@pos.com / sales123</code>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t('auth.demo_accounts.repair_man')}:</span>
              <code className="px-2 py-1 bg-white rounded-lg text-xs font-mono">repairman@pos.com / repair123</code>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground">{t('auth.demo_accounts.wholesaler')}:</span>
              <code className="px-2 py-1 bg-white rounded-lg text-xs font-mono">wholesaler@pos.com / wholesale123</code>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
