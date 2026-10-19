import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Loader2, CheckCircle, XCircle, ShieldCheck, Lock } from 'lucide-react';
import Logo3d from '../../assets/img/icon-logo-3d-amanpoll.png';

const MaintenanceBypass = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying bypass token...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No token provided.');
        return;
      }

      try {
        await axiosClient.post('/system/bypass', { secret: token });
        setStatus('success');
        setMessage('Access granted! Redirecting to dashboard...');


        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);

      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired bypass token.');


        setTimeout(() => {
          navigate('/maintenance');
        }, 3000);
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 relative overflow-hidden font-[Plus_Jakarta_Sans]">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-orange/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 text-center">

          {/* Logo Animation */}
          <div className="w-24 h-24 mx-auto mb-6 relative group">
            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse"></div>
            <img
              src={Logo3d}
              alt="Logo"
              className="w-full h-full object-contain relative z-10 animate-float drop-shadow-lg"
            />
          </div>

          <div className="space-y-6">
            {status === 'verifying' && (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse"></div>
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-text-dark mb-2">Verifying Access</h2>
                <p className="text-gray-500 font-medium">Please wait while we check your credentials...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg"></div>
                  <CheckCircle className="w-12 h-12 text-green-500 relative z-10 scale-110" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Granted</h2>
                <p className="text-green-600 font-medium bg-green-50 px-4 py-2 rounded-xl text-sm">
                  {message}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg"></div>
                  <XCircle className="w-12 h-12 text-red-500 relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                <p className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded-xl text-sm mb-4">
                  {message}
                </p>
                <div className="text-xs text-gray-400">Redirecting to maintenance page...</div>
              </div>
            )}
          </div>

          {/* Token Hash Display (Optional visual fluff) */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono bg-gray-50 py-2 rounded-lg">
              <Lock size={12} />
              <span className="truncate max-w-[200px]">{token || 'NO_TOKEN_PROVIDED'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceBypass;
