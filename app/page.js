import LoginForm from '@/app/ui/login-form';

export default function Home() {
  return (
    <div className="min-h-screen flex">
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}