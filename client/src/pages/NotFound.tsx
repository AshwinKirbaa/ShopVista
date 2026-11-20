import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-7xl font-extrabold text-blue-600 mb-2">404</span>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Sorry, the page you are looking for doesn't exist or has been moved to another location.
      </p>
      <Link to="/">
        <Button variant="primary">Return to Storefront</Button>
      </Link>
    </div>
  );
};
