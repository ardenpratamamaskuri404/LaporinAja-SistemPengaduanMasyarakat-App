import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Home } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />
    <div className="flex-1 flex items-center justify-center flex-col text-center px-4 py-32">
      <div className="text-9xl font-bold text-[#2d5a1e]/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.
      </p>
      <Link to="/" className="btn-primary">
        <Home className="w-5 h-5" /> Kembali ke Beranda
      </Link>
    </div>
    <Footer />
  </div>
);

export default NotFoundPage;
