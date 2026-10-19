import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import NotFound from './NotFound';

/**
 * Ditampilkan router saat sebuah halaman gagal dirender, menggantikan layar
 * "Unexpected Application Error" bawaan React Router.
 */
export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error('Route error:', error);

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6">
      <div className="bg-white rounded-[24px] shadow-sm p-10 max-w-md w-full text-center">
        <TriangleAlert className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-dark mb-2">Terjadi Kesalahan</h1>
        <p className="text-sm text-gray-500 mb-6">
          Halaman ini gagal ditampilkan. Coba muat ulang, atau kembali ke beranda.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Muat Ulang
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
